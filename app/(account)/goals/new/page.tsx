import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GoalForm } from '@/components/goals/goal-form';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageIntro } from '@/components/ui/page-intro';
import { requireUser } from '@/lib/server/current-user';

export const metadata: Metadata = { title: 'New goal' };

export default function NewGoalPage() {
  return (
    <>
      <PageIntro
        eyebrow="New goal"
        title="What would you like to work toward?"
        description="Start with a clear title. You can add details and a target date now or later."
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <NewGoal />
      </Suspense>
    </>
  );
}

async function NewGoal() {
  await requireUser();
  return <GoalForm />;
}
