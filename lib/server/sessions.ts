import 'server-only';
import { isUuid } from '@/lib/validation/fields';
import type { Queryable } from './database';

export const sessionPolicy = {
  absoluteMs: 24 * 60 * 60 * 1000,
  idleMs: 2 * 60 * 60 * 1000,
} as const;

export async function createSession(
  db: Queryable,
  userId: string,
  now: Date = new Date(),
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO sessions (user_id, created_at, last_seen_at, expires_at)
     VALUES ($1, $2, $2, $3) RETURNING id`,
    [userId, now.toISOString(), new Date(now.getTime() + sessionPolicy.absoluteMs).toISOString()],
  );
  return rows[0].id;
}

export async function touchSession(
  db: Queryable,
  sessionId: string,
  now: Date = new Date(),
): Promise<string | null> {
  if (!isUuid(sessionId)) {
    return null;
  }
  const { rows } = await db.query<{ user_id: string }>(
    `UPDATE sessions SET last_seen_at = $2
     WHERE id = $1 AND expires_at > $2 AND last_seen_at > $3 RETURNING user_id`,
    [sessionId, now.toISOString(), new Date(now.getTime() - sessionPolicy.idleMs).toISOString()],
  );
  if (rows[0]) {
    return rows[0].user_id;
  }
  await deleteSession(db, sessionId);
  return null;
}

export async function deleteSession(db: Queryable, sessionId: string): Promise<void> {
  if (isUuid(sessionId)) {
    await db.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  }
}
