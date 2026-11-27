import 'server-only';
import { getSessionUserId } from '../current-user';
import { getDatabase } from '../database';
import { serverError } from '../http';
import type { ApiContext } from './context';

export async function runApi(
  request: Request,
  handler: (request: Request, context: ApiContext) => Promise<Response>,
): Promise<Response> {
  try {
    const userId = await getSessionUserId();
    const context: ApiContext = {
      userId,
      get db() {
        return getDatabase();
      },
    };
    return await handler(request, context);
  } catch (error) {
    console.error('GoalBuddy API request failed:', error instanceof Error ? error.name : 'Unknown');
    return serverError();
  }
}
