import { isUuid, type FieldErrors, type Validation } from './fields';

export type GoalCursor = { createdAt: string; id: string };

export type GoalListQuery = { limit: number; cursor: GoalCursor | null };

export const pageLimits = { default: 20, max: 50 } as const;

export function encodeCursor(cursor: GoalCursor): string {
  return Buffer.from(`${cursor.createdAt}|${cursor.id}`, 'utf8').toString('base64url');
}

export function decodeCursor(value: string): GoalCursor | null {
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(value)) {
    return null;
  }
  const [createdAt, id, extra] = Buffer.from(value, 'base64url').toString('utf8').split('|');
  if (extra !== undefined || !id || !isUuid(id) || Number.isNaN(Date.parse(createdAt))) {
    return null;
  }
  return { createdAt: new Date(createdAt).toISOString(), id };
}

export function validateGoalListQuery(params: URLSearchParams): Validation<GoalListQuery> {
  const errors: FieldErrors = {};
  for (const key of params.keys()) {
    if (key !== 'limit' && key !== 'cursor') {
      errors[key] = 'This query parameter is not accepted.';
    }
  }
  const rawLimit = params.get('limit');
  let limit: number = pageLimits.default;
  if (rawLimit !== null) {
    limit = /^\d{1,3}$/.test(rawLimit) ? Number(rawLimit) : 0;
    if (limit < 1 || limit > pageLimits.max) {
      errors.limit = `Limit must be a whole number from 1 to ${pageLimits.max}.`;
    }
  }
  const rawCursor = params.get('cursor');
  const cursor = rawCursor === null ? null : decodeCursor(rawCursor);
  if (rawCursor !== null && cursor === null) {
    errors.cursor = 'Cursor is not valid.';
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { limit, cursor } };
}
