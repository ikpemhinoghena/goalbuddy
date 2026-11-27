import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { FormMessage } from '@/components/ui/form-message';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageIntro } from '@/components/ui/page-intro';
import { buttonStyles } from '@/components/ui/styles';
import { isAuthConfigured } from '@/lib/server/auth';
import { signInWithGitHub } from '@/lib/server/auth-actions';
import { getSessionUserId } from '@/lib/server/current-user';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <div className="max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Account"
        title="Sign in to GoalBuddy"
        description="GoalBuddy uses your GitHub account to sign you in. Your first sign-in creates your GoalBuddy account. GoalBuddy never sees or stores your GitHub password."
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <LoginPanel searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginPanel({ searchParams }: Pick<PageProps<'/login'>, 'searchParams'>) {
  if (await getSessionUserId()) {
    redirect('/goals');
  }
  const { error } = await searchParams;
  if (!isAuthConfigured()) {
    return (
      <FormMessage
        tone="error"
        message="Sign-in is not configured in this environment yet. Please try again later."
      />
    );
  }
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-white p-6 sm:p-8">
      <FormMessage
        tone="error"
        message={error ? 'Sign-in did not complete. Please try again.' : null}
      />
      <form action={signInWithGitHub}>
        <button type="submit" className={buttonStyles.primary}>
          Continue with GitHub
        </button>
      </form>
      <p className="text-sm leading-6 text-muted">
        GoalBuddy receives your GitHub account ID and public name to create your profile. You can
        change your display name and time zone after signing in.
      </p>
    </div>
  );
}
