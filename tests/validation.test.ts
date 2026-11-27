import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isValidDate, isValidTimezone } from '@/lib/validation/fields';
import { validateGoalCreate, validateGoalDelete, validateGoalUpdate } from '@/lib/validation/goal';
import { decodeCursor, encodeCursor, validateGoalListQuery } from '@/lib/validation/pagination';
import { validateProfileUpdate } from '@/lib/validation/profile';
import { readJsonBody } from '@/lib/validation/request';

describe('goal validation', () => {
  test('trims text and defaults optional fields', () => {
    assert.deepEqual(validateGoalCreate({ title: '  Run a 10K  ' }), {
      ok: true,
      value: { title: 'Run a 10K', description: '', targetDate: null },
    });
  });

  test('enforces title and description limits by character', () => {
    assert.equal(validateGoalCreate({ title: '🏃'.repeat(120) }).ok, true);
    const result = validateGoalCreate({ title: 'a'.repeat(121), description: 'b'.repeat(5001) });
    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.errors.title && result.errors.description);
    assert.equal(validateGoalCreate({ title: '   ' }).ok, false);
  });

  test('rejects unknown fields including forged ownership', () => {
    const result = validateGoalCreate({ title: 'Read', ownerId: 'someone-else', id: 'x' });
    assert.deepEqual(!result.ok && Object.keys(result.errors).sort(), ['id', 'ownerId']);
  });

  test('accepts past dates and rejects impossible dates', () => {
    assert.equal(validateGoalCreate({ title: 'Past', targetDate: '2001-02-28' }).ok, true);
    for (const targetDate of ['2026-02-30', '2026-13-01', '26-01-01', '0000-01-01', 20260101]) {
      assert.equal(validateGoalCreate({ title: 'Bad', targetDate }).ok, false, String(targetDate));
    }
    assert.equal(isValidDate('2028-02-29'), true);
    assert.equal(isValidDate('2027-02-29'), false);
  });

  test('requires a positive whole revision for updates and deletes', () => {
    assert.equal(validateGoalUpdate({ title: 'A', revision: 1 }).ok, true);
    for (const revision of [0, -1, 1.5, '1', undefined]) {
      assert.equal(validateGoalUpdate({ title: 'A', revision }).ok, false);
      assert.equal(validateGoalDelete({ revision }).ok, false);
    }
  });

  test('requires a JSON object body', () => {
    for (const body of [null, [], 'text', 3]) {
      assert.deepEqual(validateGoalCreate(body), {
        ok: false,
        errors: { body: 'The request body must be a JSON object.' },
      });
    }
  });
});

describe('profile validation', () => {
  test('accepts IANA time zones and rejects others', () => {
    assert.equal(isValidTimezone('UTC'), true);
    assert.equal(isValidTimezone('America/Denver'), true);
    for (const zone of ['Mars/Olympus', '+05:00', '', 'America/../Denver']) {
      assert.equal(isValidTimezone(zone), false, zone);
    }
  });

  test('validates display name, time zone, revision and unknown fields', () => {
    assert.equal(
      validateProfileUpdate({ displayName: ' Ana ', timezone: 'Europe/Paris', revision: 2 }).ok,
      true,
    );
    const result = validateProfileUpdate({
      displayName: 'x'.repeat(81),
      timezone: 'Nowhere',
      revision: 0,
      identityReference: 'github:1',
    });
    assert.deepEqual(!result.ok && Object.keys(result.errors).sort(), [
      'displayName',
      'identityReference',
      'revision',
      'timezone',
    ]);
  });
});

describe('pagination validation', () => {
  test('applies default and bounds to limit', () => {
    assert.deepEqual(validateGoalListQuery(new URLSearchParams()), {
      ok: true,
      value: { limit: 20, cursor: null },
    });
    for (const limit of ['0', '51', '-1', '2.5', 'ten']) {
      assert.equal(validateGoalListQuery(new URLSearchParams({ limit })).ok, false, limit);
    }
    assert.equal(validateGoalListQuery(new URLSearchParams({ limit: '50' })).ok, true);
  });

  test('round-trips cursors and rejects tampered values', () => {
    const cursor = { createdAt: '2026-11-27T10:00:00.000Z', id: crypto.randomUUID() };
    assert.deepEqual(decodeCursor(encodeCursor(cursor)), cursor);
    assert.equal(decodeCursor('not a cursor'), null);
    assert.equal(decodeCursor(Buffer.from('2026|not-a-uuid').toString('base64url')), null);
    assert.equal(validateGoalListQuery(new URLSearchParams({ page: '2' })).ok, false);
  });
});

describe('JSON body reading', () => {
  const url = 'http://localhost/api/goals';

  test('rejects unsupported content types with 415', async () => {
    const result = await readJsonBody(
      new Request(url, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }),
    );
    assert.equal(!result.ok && result.status, 415);
  });

  test('rejects malformed JSON with 400', async () => {
    const result = await readJsonBody(
      new Request(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"title":',
      }),
    );
    assert.equal(!result.ok && result.status, 400);
  });

  test('rejects bodies over 64 KiB with 413', async () => {
    const result = await readJsonBody(
      new Request(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ title: 'x'.repeat(70_000) }),
      }),
    );
    assert.equal(!result.ok && result.status, 413);
  });

  test('parses valid JSON', async () => {
    const result = await readJsonBody(
      new Request(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"title":"Learn"}',
      }),
    );
    assert.deepEqual(result, { ok: true, value: { title: 'Learn' } });
  });
});
