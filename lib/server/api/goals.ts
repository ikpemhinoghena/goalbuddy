import 'server-only';
import type { GoalBody, GoalDeletedBody, GoalListBody } from '@/lib/api-contract';
import { validateGoalCreate, validateGoalDelete, validateGoalUpdate } from '@/lib/validation/goal';
import { encodeCursor, validateGoalListQuery } from '@/lib/validation/pagination';
import { readJsonBody } from '@/lib/validation/request';
import { createGoal, deleteGoal, getGoal, listGoals, updateGoal } from '../goals';
import {
  bodyFailure,
  conflict,
  forbiddenOrigin,
  isSameOrigin,
  jsonResponse,
  notFound,
  unauthenticated,
  validationFailed,
} from '../http';
import type { ApiContext } from './context';

const staleGoal =
  'This goal was changed somewhere else. Reload it to see the latest version, then try again.';

export async function listGoalsRequest(request: Request, context: ApiContext): Promise<Response> {
  if (!context.userId) {
    return unauthenticated();
  }
  const query = validateGoalListQuery(new URL(request.url).searchParams);
  if (!query.ok) {
    return validationFailed(query.errors);
  }
  const page = await listGoals(context.db, context.userId, query.value);
  const body: GoalListBody = {
    goals: page.goals,
    nextCursor: page.nextCursor ? encodeCursor(page.nextCursor) : null,
  };
  return jsonResponse(body);
}

export async function createGoalRequest(request: Request, context: ApiContext): Promise<Response> {
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
  const input = validateGoalCreate(body.value);
  if (!input.ok) {
    return validationFailed(input.errors);
  }
  const response: GoalBody = { goal: await createGoal(context.db, context.userId, input.value) };
  return jsonResponse(response, 201);
}

export async function getGoalRequest(
  _request: Request,
  context: ApiContext,
  goalId: string,
): Promise<Response> {
  if (!context.userId) {
    return unauthenticated();
  }
  const goal = await getGoal(context.db, context.userId, goalId);
  if (!goal) {
    return notFound();
  }
  const body: GoalBody = { goal };
  return jsonResponse(body);
}

export async function updateGoalRequest(
  request: Request,
  context: ApiContext,
  goalId: string,
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
  const input = validateGoalUpdate(body.value);
  if (!input.ok) {
    return validationFailed(input.errors);
  }
  const { revision, ...fields } = input.value;
  const result = await updateGoal(context.db, context.userId, goalId, fields, revision);
  switch (result.status) {
    case 'updated': {
      const response: GoalBody = { goal: result.goal };
      return jsonResponse(response);
    }
    case 'invalid':
      return validationFailed(result.errors);
    case 'conflict':
      return conflict(staleGoal);
    case 'not_found':
      return notFound();
  }
}

export async function deleteGoalRequest(
  request: Request,
  context: ApiContext,
  goalId: string,
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
  const input = validateGoalDelete(body.value);
  if (!input.ok) {
    return validationFailed(input.errors);
  }
  const result = await deleteGoal(context.db, context.userId, goalId, input.value.revision);
  switch (result.status) {
    case 'deleted': {
      const response: GoalDeletedBody = { deleted: { id: goalId, ...result.removed } };
      return jsonResponse(response);
    }
    case 'conflict':
      return conflict(staleGoal);
    case 'not_found':
      return notFound();
  }
}
