import Link from 'next/link';
import { signOutOfGoalBuddy } from '@/lib/server/auth-actions';
import { getCurrentUser } from '@/lib/server/current-user';

export async function AccountNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" className="rounded-lg px-3 py-2 text-primary hover:bg-surface">
        Sign in
      </Link>
    );
  }
  return (
    <>
      <Link href="/profile" className="max-w-48 truncate rounded-lg px-3 py-2 hover:bg-surface">
        <span className="sr-only">Profile for </span>
        {user.displayName}
      </Link>
      <form action={signOutOfGoalBuddy}>
        <button
          type="submit"
          className="cursor-pointer rounded-lg px-3 py-2 font-semibold text-primary hover:bg-surface"
        >
          Sign out
        </button>
      </form>
    </>
  );
}
