import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import { createSession, deleteSession, sessionPolicy, touchSession } from '@/lib/server/sessions';
import { getUser, initialDisplayName, upsertUserByIdentity } from '@/lib/server/users';
import { createTestDatabase, createUser, type TestDatabase } from './support/database';

let db: TestDatabase;
let ownerId: string;

before(async () => {
  db = await createTestDatabase();
});

after(async () => {
  await db.close();
});

beforeEach(async () => {
  await db.query('TRUNCATE users CASCADE');
  ownerId = await createUser(db, 'Owner');
});

async function insertGoal(title = 'Goal') {
  const { rows } = await db.query<{ id: string }>(
    'INSERT INTO goals (owner_id, title) VALUES ($1, $2) RETURNING id',
    [ownerId, title],
  );
  return rows[0].id;
}

async function insertMilestone(goalId: string) {
  const { rows } = await db.query<{ id: string }>(
    'INSERT INTO milestones (goal_id, title) VALUES ($1, $2) RETURNING id',
    [goalId, 'Milestone'],
  );
  return rows[0].id;
}

describe('relationship constraints', () => {
  test('goal ownership and child parents are immutable', async () => {
    const goalId = await insertGoal();
    const otherGoal = await insertGoal('Other');
    const otherUser = await createUser(db, 'Other');
    const milestoneId = await insertMilestone(goalId);
    await assert.rejects(
      db.query('UPDATE goals SET owner_id = $1 WHERE id = $2', [otherUser, goalId]),
      /owner_id cannot be changed/,
    );
    await assert.rejects(
      db.query('UPDATE milestones SET goal_id = $1 WHERE id = $2', [otherGoal, milestoneId]),
      /goal_id cannot be changed/,
    );
  });

  test('a task cannot reference a milestone from another goal', async () => {
    const goalId = await insertGoal();
    const otherGoal = await insertGoal('Other');
    const foreignMilestone = await insertMilestone(otherGoal);
    await assert.rejects(
      db.query('INSERT INTO tasks (goal_id, milestone_id, title) VALUES ($1, $2, $3)', [
        goalId,
        foreignMilestone,
        'Cross-goal task',
      ]),
      /foreign key/,
    );
  });

  test('completion requires a matching timestamp', async () => {
    const goalId = await insertGoal();
    await assert.rejects(
      db.query('INSERT INTO tasks (goal_id, title, completed) VALUES ($1, $2, true)', [
        goalId,
        'Done without time',
      ]),
      /check constraint/,
    );
    await assert.rejects(
      db.query('INSERT INTO tasks (goal_id, title, completed_at) VALUES ($1, $2, now())', [
        goalId,
        'Open with time',
      ]),
      /check constraint/,
    );
  });

  test('deleting a milestone removes its tasks and keeps direct goal tasks', async () => {
    const goalId = await insertGoal();
    const milestoneId = await insertMilestone(goalId);
    await db.query('INSERT INTO tasks (goal_id, milestone_id, title) VALUES ($1, $2, $3)', [
      goalId,
      milestoneId,
      'Attached',
    ]);
    await db.query('INSERT INTO tasks (goal_id, title) VALUES ($1, $2)', [goalId, 'Direct']);
    await db.query('DELETE FROM milestones WHERE id = $1', [milestoneId]);
    const { rows } = await db.query<{ title: string }>(
      'SELECT title FROM tasks WHERE goal_id = $1',
      [goalId],
    );
    assert.deepEqual(
      rows.map((row) => row.title),
      ['Direct'],
    );
  });

  test('database rejects untrimmed or oversized titles', async () => {
    await assert.rejects(insertGoal(' padded '), /check constraint/);
    await assert.rejects(insertGoal('x'.repeat(121)), /check constraint/);
  });
});

describe('accounts and sessions', () => {
  test('first sign-in creates a profile and later sign-ins reuse it', async () => {
    const first = await upsertUserByIdentity(db, 'github:42', 'Octo Cat');
    await db.query('UPDATE users SET display_name = $1 WHERE id = $2', ['Custom name', first.id]);
    const second = await upsertUserByIdentity(db, 'github:42', 'Octo Cat');
    assert.equal(second.id, first.id);
    assert.equal(second.displayName, 'Custom name');
    assert.equal(second.timezone, 'UTC');
  });

  test('initial display names fall back and stay within limits', () => {
    assert.equal(initialDisplayName(null, ' octocat '), 'octocat');
    assert.equal(initialDisplayName('', undefined), 'GoalBuddy member');
    assert.equal(initialDisplayName('n'.repeat(100)).length, 80);
  });

  test('sessions expire after idle and absolute limits and revoke on sign-out', async () => {
    const start = new Date('2026-11-27T12:00:00.000Z');
    const at = (ms: number) => new Date(start.getTime() + ms);
    const sessionId = await createSession(db, ownerId, start);
    assert.equal(await touchSession(db, sessionId, at(sessionPolicy.idleMs - 1000)), ownerId);
    assert.equal(await touchSession(db, sessionId, at(sessionPolicy.idleMs * 2 + 1000)), null);

    const active = await createSession(db, ownerId, start);
    for (let elapsed = 0; elapsed < sessionPolicy.absoluteMs; elapsed += sessionPolicy.idleMs / 2) {
      assert.equal(await touchSession(db, active, at(elapsed)), ownerId);
    }
    assert.equal(await touchSession(db, active, at(sessionPolicy.absoluteMs)), null);

    const revoked = await createSession(db, ownerId, start);
    await deleteSession(db, revoked);
    assert.equal(await touchSession(db, revoked, at(1000)), null);
    assert.equal(await touchSession(db, 'forged', at(1000)), null);
  });

  test('profile lookups ignore malformed ids', async () => {
    assert.equal(await getUser(db, 'not-a-uuid'), null);
    assert.equal((await getUser(db, ownerId))?.displayName, 'Owner');
  });
});
