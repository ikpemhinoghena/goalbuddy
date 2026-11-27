import { deleteGoalRequest, getGoalRequest, updateGoalRequest } from '@/lib/server/api/goals';
import { runApi } from '@/lib/server/api/run';

export async function GET(request: Request, context: RouteContext<'/api/goals/[goalId]'>) {
  const { goalId } = await context.params;
  return runApi(request, (req, api) => getGoalRequest(req, api, goalId));
}

export async function PUT(request: Request, context: RouteContext<'/api/goals/[goalId]'>) {
  const { goalId } = await context.params;
  return runApi(request, (req, api) => updateGoalRequest(req, api, goalId));
}

export async function DELETE(request: Request, context: RouteContext<'/api/goals/[goalId]'>) {
  const { goalId } = await context.params;
  return runApi(request, (req, api) => deleteGoalRequest(req, api, goalId));
}
