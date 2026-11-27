import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileForm } from '@/components/profile/profile-form';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageIntro } from '@/components/ui/page-intro';
import { buttonStyles } from '@/components/ui/styles';
import { signOutOfGoalBuddy } from '@/lib/server/auth-actions';
import { requireUser } from '@/lib/server/current-user';

export const metadata: Metadata = { title: 'Profile' };

function timezoneOptions(current: string): string[] {
  const zones = new Set([current, ...Intl.supportedValuesOf('timeZone')]);
  zones.delete('UTC');
  return ['UTC', ...Array.from(zones).sort((a, b) => a.localeCompare(b))];
}

export default function ProfilePage() {
  return (
    <>
      <PageIntro
        eyebrow="Account"
        title="Your profile"
        description="Choose how your name appears in GoalBuddy and which time zone to use for dates and times."
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <Profile />
      </Suspense>
    </>
  );
}

async function Profile() {
  const user = await requireUser();
  return (
    <>
      <ProfileForm
        profile={{
          displayName: user.displayName,
          timezone: user.timezone,
          revision: user.revision,
        }}
        timezones={timezoneOptions(user.timezone)}
      />
      <section aria-labelledby="sign-out-title" className="max-w-2xl border-t border-border pt-8">
        <h2 id="sign-out-title" className="text-xl font-semibold">
          Sign out
        </h2>
        <p className="mt-2 leading-7 text-muted">
          Signing out ends this GoalBuddy session on the server.
        </p>
        <form action={signOutOfGoalBuddy} className="mt-4">
          <button type="submit" className={buttonStyles.secondary}>
            Sign out
          </button>
        </form>
      </section>
    </>
  );
}
