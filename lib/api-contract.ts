import type { Goal, User } from '@/lib/models';
import { isRecord, type FieldErrors } from '@/lib/validation/fields';

export type ApiErrorCode =
  | 'bad_request'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'payload_too_large'
  | 'unsupported_media_type'
  | 'validation_failed'
  | 'server_error';

export type ApiError = { code: ApiErrorCode; message: string; fields?: FieldErrors };

export type ApiErrorBody = { error: ApiError };

export type Profile = Pick<User, 'id' | 'displayName' | 'timezone' | 'revision' | 'updatedAt'>;

export type GoalBody = { goal: Goal };

export type GoalListBody = { goals: Goal[]; nextCursor: string | null };

export type ProfileBody = { profile: Profile };

export type GoalDeletedBody = { deleted: { id: string; milestones: number; tasks: number } };

export function readApiError(body: unknown): ApiError | null {
  if (!isRecord(body) || !isRecord(body.error) || typeof body.error.message !== 'string') {
    return null;
  }
  const fields = isRecord(body.error.fields)
    ? Object.fromEntries(
        Object.entries(body.error.fields).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
    : undefined;
  return { code: body.error.code as ApiErrorCode, message: body.error.message, fields };
}

export function hasGoal(body: unknown): body is GoalBody {
  return isRecord(body) && isRecord(body.goal) && typeof body.goal.id === 'string';
}

export function hasProfile(body: unknown): body is ProfileBody {
  return isRecord(body) && isRecord(body.profile) && typeof body.profile.revision === 'number';
}
