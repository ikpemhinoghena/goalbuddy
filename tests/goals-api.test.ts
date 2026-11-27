import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import type { GoalBody, GoalListBody } from '@/lib/api-contract';
import type { ApiContext } from '@/lib/server/api/context';
import {
  createGoalRequest,
  deleteGoalRequest,
  getGoalRequest,
  listGoalsRequest,
  updateGoalRequest,
} from '@/lib/server/api/goals';
import type { Queryable } from '@/lib/server/database';
import { createTestDatabase, createUser, jsonRequest, type TestDatabase } from './support/database';

let db: TestDatabase;
let alice: ApiContext;
let bob: ApiContext;
let anonymous: ApiContext;

before(async () => {
  db = await createTestDatabase();
});

after(async () => {
  await db.close();
});

beforeEach(async () => {
  await db.query('TRUNCATE users CASCADE');
  alice = { db, userId: await createUser(db, 'Alice') };
  bob = { db, userId: await createUser(db, 'Bob') };
  anonymous = { db, userId: null };
});

async function createGoal(context: ApiContext, body: Record<string, unknown>) {
  const response = await createGoalRequest(jsonRequest('/api/goals', 'POST', body), context);
  assert.equal(response.status, 201);
  return ((await response.json()) as GoalBody).goal;
}

async function addPlan(goalId: string, deadline: string | null = null) {
  const { rows } = await db.query<{ id: string }>(
    'INSERT INTO milestones (goal_id, title, deadline) VALUES ($1, $2, $3) RETURNING id',
    [goalId, 'Milestone', deadline],
  );
  await db.query('INSERT INTO tasks (goal_id, milestone_id, title) VALUES ($1, $2, $3)', [
    goalId,
    rows[0].id,
    'Milestone task',
  ]);
  await db.query('INSERT INTO tasks (goal_id, title) VALUES ($1, $2)', [goalId, 'Direct task']);
}

async function count(table: string, goalId: string) {
  const column = table === 'goals' ? 'id' : 'goal_id';
  const { rows } = await db.query<{ count: number }>(
    `SELECT count(*)::int AS count FROM ${table} WHERE ${column} = $1`,
    [goalId],
  );
  return rows[0].count;
}

describe('goal CRUD lifecycle', () => {
  test('creates, lists, reads, updates and deletes an owned goal', async () => {
    const created = await createGoal(alice, {
      title: '  Learn Spanish ',
      description: 'Conversational level',
      targetDate: '2027-06-30',
    });
    assert.equal(created.title, 'Learn Spanish');
    assert.equal(created.revision, 1);
    assert.equal(created.ownerId, alice.userId);

    const listed = await listGoalsRequest(jsonRequest('/api/goals', 'GET'), alice);
    assert.equal(listed.status, 200);
    assert.equal(listed.headers.get('cache-control'), 'no-store');
    assert.deepEqual(
      ((await listed.json()) as GoalListBody).goals.map((goal) => goal.id),
      [created.id],
    );

    const read = await getGoalRequest(
      jsonRequest(`/api/goals/${created.id}`, 'GET'),
      alice,
      created.id,
    );
    assert.equal(((await read.json()) as GoalBody).goal.targetDate, '2027-06-30');

    const updated = await updateGoalRequest(
      jsonRequest(`/api/goals/${created.id}`, 'PUT', {
        title: 'Learn Portuguese',
        description: '',
        targetDate: null,
        revision: 1,
      }),
      alice,
      created.id,
    );
    assert.equal(updated.status, 200);
    const updatedGoal = ((await updated.json()) as GoalBody).goal;
    assert.equal(updatedGoal.revision, 2);
    assert.equal(updatedGoal.targetDate, null);

    const reloaded = await getGoalRequest(
      jsonRequest(`/api/goals/${created.id}`, 'GET'),
      alice,
      created.id,
    );
    assert.equal(((await reloaded.json()) as GoalBody).goal.title, 'Learn Portuguese');

    const deleted = await deleteGoalRequest(
      jsonRequest(`/api/goals/${created.id}`, 'DELETE', { revision: 2 }),
      alice,
      created.id,
    );
    assert.equal(deleted.status, 200);
    assert.equal(await count('goals', created.id), 0);
  });

  test('keeps duplicate titles distinguishable by id', async () => {
    const first = await createGoal(alice, { title: 'Read more' });
    const second = await createGoal(alice, { title: 'Read more' });
    assert.notEqual(first.id, second.id);
  });

  test('rejects invalid input with 422 and leaves stored state unchanged', async () => {
    const goal = await createGoal(alice, { title: 'Original' });
    const response = await updateGoalRequest(
      jsonRequest(`/api/goals/${goal.id}`, 'PUT', { title: '', revision: 1, ownerId: bob.userId }),
      alice,
      goal.id,
    );
    assert.equal(response.status, 422);
    const body = (await response.json()) as { error: { fields: Record<string, string> } };
    assert.deepEqual(Object.keys(body.error.fields).sort(), ['ownerId', 'title']);
    const { rows } = await db.query<{ title: string; owner_id: string }>(
      'SELECT title, owner_id FROM goals WHERE id = $1',
      [goal.id],
    );
    assert.deepEqual(rows[0], { title: 'Original', owner_id: alice.userId });
  });

  test('returns 409 for stale revisions without changing the goal', async () => {
    const goal = await createGoal(alice, { title: 'Version one' });
    const update = (title: string) =>
      updateGoalRequest(
        jsonRequest(`/api/goals/${goal.id}`, 'PUT', { title, revision: 1 }),
        alice,
        goal.id,
      );
    assert.equal((await update('Version two')).status, 200);
    assert.equal((await update('Stale edit')).status, 409);
    const stale = await deleteGoalRequest(
      jsonRequest(`/api/goals/${goal.id}`, 'DELETE', { revision: 1 }),
      alice,
      goal.id,
    );
    assert.equal(stale.status, 409);
    const { rows } = await db.query<{ title: string; revision: number }>(
      'SELECT title, revision FROM goals WHERE id = $1',
      [goal.id],
    );
    assert.deepEqual(rows[0], { title: 'Version two', revision: 2 });
  });

  test('rejects a target date earlier than child deadlines', async () => {
    const goal = await createGoal(alice, { title: 'Ship app', targetDate: '2027-12-31' });
    await addPlan(goal.id, '2027-09-01');
    const tooEarly = await updateGoalRequest(
      jsonRequest(`/api/goals/${goal.id}`, 'PUT', {
        title: 'Ship app',
        targetDate: '2027-08-31',
        revision: 1,
      }),
      alice,
      goal.id,
    );
    assert.equal(tooEarly.status, 422);
    const sameDay = await updateGoalRequest(
      jsonRequest(`/api/goals/${goal.id}`, 'PUT', {
        title: 'Ship app',
        targetDate: '2027-09-01',
        revision: 1,
      }),
      alice,
      goal.id,
    );
    assert.equal(sameDay.status, 200);
  });

  test('paginates newest first with bounded limits and stable cursors', async () => {
    const ids: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      ids.push((await createGoal(alice, { title: `Goal ${index}` })).id);
    }
    const seen: string[] = [];
    let cursor: string | null = null;
    do {
      const query: string = cursor ? `?limit=2&cursor=${cursor}` : '?limit=2';
      const response = await listGoalsRequest(jsonRequest(`/api/goals${query}`, 'GET'), alice);
      const body = (await response.json()) as GoalListBody;
      assert.ok(body.goals.length <= 2);
      seen.push(...body.goals.map((goal) => goal.id));
      cursor = body.nextCursor;
    } while (cursor);
    assert.equal(seen.length, 5);
    assert.deepEqual([...seen].sort(), [...ids].sort());
    const tooMany = await listGoalsRequest(jsonRequest('/api/goals?limit=51', 'GET'), alice);
    assert.equal(tooMany.status, 422);
  });
});

describe('request safety', () => {
  test('returns 401 for every operation without a session', async () => {
    const goal = await createGoal(alice, { title: 'Private' });
    const responses = await Promise.all([
      listGoalsRequest(jsonRequest('/api/goals', 'GET'), anonymous),
      createGoalRequest(jsonRequest('/api/goals', 'POST', { title: 'x' }), anonymous),
      getGoalRequest(jsonRequest(`/api/goals/${goal.id}`, 'GET'), anonymous, goal.id),
      updateGoalRequest(
        jsonRequest(`/api/goals/${goal.id}`, 'PUT', { title: 'x', revision: 1 }),
        anonymous,
        goal.id,
      ),
      deleteGoalRequest(
        jsonRequest(`/api/goals/${goal.id}`, 'DELETE', { revision: 1 }),
        anonymous,
        goal.id,
      ),
    ]);
    assert.deepEqual(
      responses.map((response) => response.status),
      [401, 401, 401, 401, 401],
    );
  });

  test('rejects cross-origin mutations with 403', async () => {
    const response = await createGoalRequest(
      jsonRequest('/api/goals', 'POST', { title: 'x' }, { origin: 'https://evil.example' }),
      alice,
    );
    assert.equal(response.status, 403);
    const { rows } = await db.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM goals WHERE owner_id = $1',
      [alice.userId],
    );
    assert.equal(rows[0].count, 0);
  });

  test('maps body failures to 400, 413 and 415', async () => {
    const malformed = new Request('http://localhost:3000/api/goals', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      body: '{',
    });
    const wrongType = new Request('http://localhost:3000/api/goals', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'content-type': 'text/plain' },
      body: '{}',
    });
    const large = jsonRequest('/api/goals', 'POST', {
      title: 'x',
      description: 'y'.repeat(70_000),
    });
    assert.equal((await createGoalRequest(malformed, alice)).status, 400);
    assert.equal((await createGoalRequest(wrongType, alice)).status, 415);
    assert.equal((await createGoalRequest(large, alice)).status, 413);
  });
});

describe('ownership isolation', () => {
  test('foreign, missing and malformed ids are indistinguishable 404s', async () => {
    const goal = await createGoal(alice, { title: 'Alice only', description: 'secret' });
    const missing = crypto.randomUUID();
    const bodies: string[] = [];
    for (const id of [goal.id, missing, 'not-a-uuid']) {
      const response = await getGoalRequest(jsonRequest(`/api/goals/${id}`, 'GET'), bob, id);
      assert.equal(response.status, 404);
      bodies.push(await response.text());
    }
    assert.equal(new Set(bodies).size, 1);
    assert.ok(!bodies[0].includes('secret'));
  });

  test('another user cannot list, update or delete a goal', async () => {
    const goal = await createGoal(alice, { title: 'Alice goal' });
    await createGoal(bob, { title: 'Bob goal' });
    const list = (await (
      await listGoalsRequest(jsonRequest('/api/goals', 'GET'), bob)
    ).json()) as GoalListBody;
    assert.deepEqual(
      list.goals.map((item) => item.title),
      ['Bob goal'],
    );
    const update = await updateGoalRequest(
      jsonRequest(`/api/goals/${goal.id}`, 'PUT', { title: 'Taken over', revision: 1 }),
      bob,
      goal.id,
    );
    const remove = await deleteGoalRequest(
      jsonRequest(`/api/goals/${goal.id}`, 'DELETE', { revision: 1 }),
      bob,
      goal.id,
    );
    assert.equal(update.status, 404);
    assert.equal(remove.status, 404);
    const { rows } = await db.query<{ title: string; revision: number }>(
      'SELECT title, revision FROM goals WHERE id = $1',
      [goal.id],
    );
    assert.deepEqual(rows[0], { title: 'Alice goal', revision: 1 });
  });
});

describe('cascade deletion', () => {
  test('deletes milestones and tasks with the goal and reports the impact', async () => {
    const goal = await createGoal(alice, { title: 'Plan with children' });
    await addPlan(goal.id);
    const response = await deleteGoalRequest(
      jsonRequest(`/api/goals/${goal.id}`, 'DELETE', { revision: 1 }),
      alice,
      goal.id,
    );
    assert.deepEqual(await response.json(), {
      deleted: { id: goal.id, milestones: 1, tasks: 2 },
    });
    assert.equal(await count('milestones', goal.id), 0);
    assert.equal(await count('tasks', goal.id), 0);
  });

  test('rolls back the whole deletion when the transaction fails', async () => {
    const goal = await createGoal(alice, { title: 'Survives failure' });
    await addPlan(goal.id);
    const failing: TestDatabase = {
      ...db,
      transaction: (work) =>
        db.transaction((tx) =>
          work({
            async query(text: string, params?: unknown[]) {
              const result = await tx.query(text, params);
              if (text.startsWith('DELETE FROM goals')) {
                throw new Error('simulated failure');
              }
              return result;
            },
          } as Queryable),
        ),
    };
    await assert.rejects(
      deleteGoalRequest(
        jsonRequest(`/api/goals/${goal.id}`, 'DELETE', { revision: 1 }),
        { db: failing, userId: alice.userId },
        goal.id,
      ),
      /simulated failure/,
    );
    assert.equal(await count('goals', goal.id), 1);
    assert.equal(await count('milestones', goal.id), 1);
    assert.equal(await count('tasks', goal.id), 2);
  });
});
