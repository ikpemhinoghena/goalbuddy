import 'server-only';
import type { Goal } from '@/lib/models';
import { isUuid, type FieldErrors } from '@/lib/validation/fields';
import type { GoalInput } from '@/lib/validation/goal';
import type { GoalCursor, GoalListQuery } from '@/lib/validation/pagination';
import type { Database, Queryable } from './database';

type GoalRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  target_date: string | null;
  revision: number;
  created_at: Date;
  updated_at: Date;
};

export type GoalPlanCounts = { milestones: number; tasks: number };

export type GoalPage = { goals: Goal[]; nextCursor: GoalCursor | null };

export type GoalUpdateResult =
  | { status: 'updated'; goal: Goal }
  | { status: 'not_found' }
  | { status: 'conflict' }
  | { status: 'invalid'; errors: FieldErrors };

export type GoalDeleteResult =
  { status: 'deleted'; removed: GoalPlanCounts } | { status: 'not_found' } | { status: 'conflict' };

const goalColumns =
  'id, owner_id, title, description, target_date::text AS target_date, revision, created_at, updated_at';

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    targetDate: row.target_date,
    revision: row.revision,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listGoals(
  db: Queryable,
  ownerId: string,
  query: GoalListQuery,
): Promise<GoalPage> {
  const params: unknown[] = [ownerId, query.limit + 1];
  let filter = 'owner_id = $1';
  if (query.cursor) {
    params.push(query.cursor.createdAt, query.cursor.id);
    filter += ' AND (created_at, id) < ($3::timestamptz, $4::uuid)';
  }
  const { rows } = await db.query<GoalRow>(
    `SELECT ${goalColumns} FROM goals WHERE ${filter}
     ORDER BY created_at DESC, id DESC LIMIT $2`,
    params,
  );
  const goals = rows.slice(0, query.limit).map(toGoal);
  const last = goals.at(-1);
  return {
    goals,
    nextCursor:
      rows.length > query.limit && last ? { createdAt: last.createdAt, id: last.id } : null,
  };
}

export async function getGoal(
  db: Queryable,
  ownerId: string,
  goalId: string,
): Promise<Goal | null> {
  if (!isUuid(goalId)) {
    return null;
  }
  const { rows } = await db.query<GoalRow>(
    `SELECT ${goalColumns} FROM goals WHERE id = $1 AND owner_id = $2`,
    [goalId, ownerId],
  );
  return rows[0] ? toGoal(rows[0]) : null;
}

async function countPlan(db: Queryable, goalId: string): Promise<GoalPlanCounts> {
  const { rows } = await db.query<GoalPlanCounts>(
    `SELECT (SELECT count(*) FROM milestones WHERE goal_id = $1)::int AS milestones,
            (SELECT count(*) FROM tasks WHERE goal_id = $1)::int AS tasks`,
    [goalId],
  );
  return rows[0];
}

export async function getGoalPlanCounts(
  db: Queryable,
  ownerId: string,
  goalId: string,
): Promise<GoalPlanCounts | null> {
  return (await getGoal(db, ownerId, goalId)) ? countPlan(db, goalId) : null;
}

export async function createGoal(db: Queryable, ownerId: string, input: GoalInput): Promise<Goal> {
  const { rows } = await db.query<GoalRow>(
    `INSERT INTO goals (owner_id, title, description, target_date)
     VALUES ($1, $2, $3, $4::date) RETURNING ${goalColumns}`,
    [ownerId, input.title, input.description, input.targetDate],
  );
  return toGoal(rows[0]);
}

async function lockOwnedGoal(
  tx: Queryable,
  ownerId: string,
  goalId: string,
): Promise<number | null> {
  if (!isUuid(goalId)) {
    return null;
  }
  const { rows } = await tx.query<{ revision: number }>(
    'SELECT revision FROM goals WHERE id = $1 AND owner_id = $2 FOR UPDATE',
    [goalId, ownerId],
  );
  return rows[0]?.revision ?? null;
}

export async function updateGoal(
  db: Database,
  ownerId: string,
  goalId: string,
  input: GoalInput,
  expectedRevision: number,
): Promise<GoalUpdateResult> {
  return db.transaction(async (tx) => {
    const revision = await lockOwnedGoal(tx, ownerId, goalId);
    if (revision === null) {
      return { status: 'not_found' };
    }
    if (revision !== expectedRevision) {
      return { status: 'conflict' };
    }
    if (input.targetDate) {
      const { rows } = await tx.query<{ late: number }>(
        `SELECT ((SELECT count(*) FROM milestones WHERE goal_id = $1 AND deadline > $2::date)
               + (SELECT count(*) FROM tasks WHERE goal_id = $1 AND deadline > $2::date))::int AS late`,
        [goalId, input.targetDate],
      );
      if (rows[0].late > 0) {
        return {
          status: 'invalid',
          errors: {
            targetDate:
              'The target date cannot be earlier than deadlines already set for its milestones or tasks.',
          },
        };
      }
    }
    const { rows } = await tx.query<GoalRow>(
      `UPDATE goals SET title = $3, description = $4, target_date = $5::date,
         revision = revision + 1, updated_at = date_trunc('milliseconds', now())
       WHERE id = $1 AND owner_id = $2 RETURNING ${goalColumns}`,
      [goalId, ownerId, input.title, input.description, input.targetDate],
    );
    return { status: 'updated', goal: toGoal(rows[0]) };
  });
}

export async function deleteGoal(
  db: Database,
  ownerId: string,
  goalId: string,
  expectedRevision: number,
): Promise<GoalDeleteResult> {
  return db.transaction(async (tx) => {
    const revision = await lockOwnedGoal(tx, ownerId, goalId);
    if (revision === null) {
      return { status: 'not_found' };
    }
    if (revision !== expectedRevision) {
      return { status: 'conflict' };
    }
    const removed = await countPlan(tx, goalId);
    await tx.query('DELETE FROM goals WHERE id = $1 AND owner_id = $2', [goalId, ownerId]);
    return { status: 'deleted', removed };
  });
}
