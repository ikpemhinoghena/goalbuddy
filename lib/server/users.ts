import 'server-only';
import type { User } from '@/lib/models';
import { characterCount, isUuid, textLimits } from '@/lib/validation/fields';
import type { ProfileUpdateInput } from '@/lib/validation/profile';
import type { Queryable } from './database';

type UserRow = {
  id: string;
  identity_reference: string;
  display_name: string;
  timezone: string;
  revision: number;
  created_at: Date;
  updated_at: Date;
};

const userColumns =
  'id, identity_reference, display_name, timezone, revision, created_at, updated_at';

function toUser(row: UserRow): User {
  return {
    id: row.id,
    identityReference: row.identity_reference,
    displayName: row.display_name,
    timezone: row.timezone,
    revision: row.revision,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function initialDisplayName(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      const trimmed = candidate.trim();
      return characterCount(trimmed) > textLimits.displayName
        ? Array.from(trimmed).slice(0, textLimits.displayName).join('').trim()
        : trimmed;
    }
  }
  return 'GoalBuddy member';
}

export async function upsertUserByIdentity(
  db: Queryable,
  identityReference: string,
  displayName: string,
): Promise<User> {
  const { rows } = await db.query<UserRow>(
    `INSERT INTO users (identity_reference, display_name) VALUES ($1, $2)
     ON CONFLICT (identity_reference) DO UPDATE SET identity_reference = EXCLUDED.identity_reference
     RETURNING ${userColumns}`,
    [identityReference, displayName],
  );
  return toUser(rows[0]);
}

export async function getUser(db: Queryable, userId: string): Promise<User | null> {
  if (!isUuid(userId)) {
    return null;
  }
  const { rows } = await db.query<UserRow>(`SELECT ${userColumns} FROM users WHERE id = $1`, [
    userId,
  ]);
  return rows[0] ? toUser(rows[0]) : null;
}

export type ProfileUpdateResult =
  { status: 'updated'; user: User } | { status: 'not_found' } | { status: 'conflict' };

export async function updateProfile(
  db: Queryable,
  userId: string,
  input: ProfileUpdateInput,
): Promise<ProfileUpdateResult> {
  const { rows } = await db.query<UserRow>(
    `UPDATE users SET display_name = $2, timezone = $3, revision = revision + 1,
       updated_at = date_trunc('milliseconds', now())
     WHERE id = $1 AND revision = $4 RETURNING ${userColumns}`,
    [userId, input.displayName, input.timezone, input.revision],
  );
  if (rows[0]) {
    return { status: 'updated', user: toUser(rows[0]) };
  }
  return (await getUser(db, userId)) ? { status: 'conflict' } : { status: 'not_found' };
}
