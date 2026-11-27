import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import type { ProfileBody } from '@/lib/api-contract';
import type { ApiContext } from '@/lib/server/api/context';
import { getProfileRequest, updateProfileRequest } from '@/lib/server/api/profile';
import { createTestDatabase, createUser, jsonRequest, type TestDatabase } from './support/database';

let db: TestDatabase;
let alice: ApiContext;
let bobId: string;

before(async () => {
  db = await createTestDatabase();
});

after(async () => {
  await db.close();
});

beforeEach(async () => {
  await db.query('TRUNCATE users CASCADE');
  alice = { db, userId: await createUser(db, 'Alice') };
  bobId = await createUser(db, 'Bob');
});

const update = (context: ApiContext, body: unknown) =>
  updateProfileRequest(jsonRequest('/api/profile', 'PUT', body), context);

describe('profile API', () => {
  test('reads and updates only the signed-in profile and persists the change', async () => {
    const response = await update(alice, {
      displayName: '  Alice A. ',
      timezone: 'America/Denver',
      revision: 1,
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const saved = ((await response.json()) as ProfileBody).profile;
    assert.deepEqual(
      [saved.displayName, saved.timezone, saved.revision],
      ['Alice A.', 'America/Denver', 2],
    );

    const reloaded = (await (
      await getProfileRequest(jsonRequest('/api/profile', 'GET'), alice)
    ).json()) as ProfileBody;
    assert.equal(reloaded.profile.timezone, 'America/Denver');

    const { rows } = await db.query<{ display_name: string }>(
      'SELECT display_name FROM users WHERE id = $1',
      [bobId],
    );
    assert.equal(rows[0].display_name, 'Bob');
  });

  test('rejects stale revisions, invalid fields and unauthenticated access', async () => {
    assert.equal(
      (await update(alice, { displayName: 'A', timezone: 'UTC', revision: 1 })).status,
      200,
    );
    assert.equal(
      (await update(alice, { displayName: 'B', timezone: 'UTC', revision: 1 })).status,
      409,
    );
    const invalid = await update(alice, { displayName: '', timezone: 'Atlantis', revision: 2 });
    assert.equal(invalid.status, 422);
    assert.equal((await update({ db, userId: null }, { displayName: 'C' })).status, 401);
    assert.equal(
      (await getProfileRequest(jsonRequest('/api/profile', 'GET'), { db, userId: null })).status,
      401,
    );
  });

  test('rejects cross-origin profile updates', async () => {
    const response = await updateProfileRequest(
      jsonRequest(
        '/api/profile',
        'PUT',
        { displayName: 'Hijacked', timezone: 'UTC', revision: 1 },
        { origin: 'https://evil.example' },
      ),
      alice,
    );
    assert.equal(response.status, 403);
  });
});
