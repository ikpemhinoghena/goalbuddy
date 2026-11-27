import 'server-only';
import type { Profile, ProfileBody } from '@/lib/api-contract';
import type { User } from '@/lib/models';
import { validateProfileUpdate } from '@/lib/validation/profile';
import { readJsonBody } from '@/lib/validation/request';
import {
  bodyFailure,
  conflict,
  forbiddenOrigin,
  isSameOrigin,
  jsonResponse,
  unauthenticated,
  validationFailed,
} from '../http';
import { getUser, updateProfile } from '../users';
import type { ApiContext } from './context';

function toProfile(user: User): Profile {
  return {
    id: user.id,
    displayName: user.displayName,
    timezone: user.timezone,
    revision: user.revision,
    updatedAt: user.updatedAt,
  };
}

export async function getProfileRequest(_request: Request, context: ApiContext): Promise<Response> {
  const user = context.userId ? await getUser(context.db, context.userId) : null;
  if (!user) {
    return unauthenticated();
  }
  const body: ProfileBody = { profile: toProfile(user) };
  return jsonResponse(body);
}

export async function updateProfileRequest(
  request: Request,
  context: ApiContext,
): Promise<Response> {
  if (!context.userId) {
    return unauthenticated();
  }
  if (!isSameOrigin(request)) {
    return forbiddenOrigin();
  }
  const body = await readJsonBody(request);
  if (!body.ok) {
    return bodyFailure(body);
  }
  const input = validateProfileUpdate(body.value);
  if (!input.ok) {
    return validationFailed(input.errors);
  }
  const result = await updateProfile(context.db, context.userId, input.value);
  switch (result.status) {
    case 'updated': {
      const response: ProfileBody = { profile: toProfile(result.user) };
      return jsonResponse(response);
    }
    case 'conflict':
      return conflict(
        'Your profile was changed somewhere else. Reload the page to see the latest version.',
      );
    case 'not_found':
      return unauthenticated();
  }
}
