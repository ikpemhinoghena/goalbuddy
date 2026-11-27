import { createGoalRequest, listGoalsRequest } from '@/lib/server/api/goals';
import { runApi } from '@/lib/server/api/run';

export function GET(request: Request) {
  return runApi(request, listGoalsRequest);
}

export function POST(request: Request) {
  return runApi(request, createGoalRequest);
}
