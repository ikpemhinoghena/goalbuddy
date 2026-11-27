import 'server-only';
import type { ApiErrorBody, ApiErrorCode } from '@/lib/api-contract';
import type { FieldErrors } from '@/lib/validation/fields';
import type { JsonBodyFailure } from '@/lib/validation/request';

const privateHeaders = { 'Cache-Control': 'no-store' };

export function jsonResponse(body: unknown, status: number = 200): Response {
  return Response.json(body, { status, headers: privateHeaders });
}

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: FieldErrors,
): Response {
  const body: ApiErrorBody = { error: fields ? { code, message, fields } : { code, message } };
  return jsonResponse(body, status);
}

export function unauthenticated(): Response {
  return errorResponse(401, 'unauthenticated', 'Sign in to continue.');
}

export function forbiddenOrigin(): Response {
  return errorResponse(403, 'forbidden', 'This request must come from GoalBuddy.');
}

export function notFound(): Response {
  return errorResponse(404, 'not_found', 'This item was not found.');
}

export function conflict(message: string): Response {
  return errorResponse(409, 'conflict', message);
}

export function validationFailed(fields: FieldErrors): Response {
  return errorResponse(422, 'validation_failed', 'Some fields need attention.', fields);
}

export function bodyFailure(failure: JsonBodyFailure): Response {
  return errorResponse(failure.status, failure.code, failure.message);
}

export function serverError(): Response {
  return errorResponse(500, 'server_error', 'Something went wrong. Please try again.');
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin) {
    return origin === new URL(request.url).origin;
  }
  return request.headers.get('sec-fetch-site') === 'same-origin';
}
