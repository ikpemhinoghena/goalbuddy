import { getProfileRequest, updateProfileRequest } from '@/lib/server/api/profile';
import { runApi } from '@/lib/server/api/run';

export function GET(request: Request) {
  return runApi(request, getProfileRequest);
}

export function PUT(request: Request) {
  return runApi(request, updateProfileRequest);
}
