import 'server-only';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import type { User } from '@/lib/models';
import { auth, isAuthConfigured } from './auth';
import { getDatabase } from './database';
import { getUser } from './users';

export async function getSessionUserId(): Promise<string | null> {
  await connection();
  if (!isAuthConfigured()) {
    return null;
  }
  const session = await auth();
  return session?.user?.id || null;
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  return userId ? getUser(getDatabase(), userId) : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
