'use server';

import { signIn, signOut } from './auth';

export async function signInWithGitHub() {
  await signIn('github', { redirectTo: '/goals' });
}

export async function signOutOfGoalBuddy() {
  await signOut({ redirectTo: '/' });
}
