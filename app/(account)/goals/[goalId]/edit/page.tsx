import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { GoalForm } from '@/components/goals/goal-form';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageIntro } from '@/components/ui/page-intro';
import { requireUser } from '@/lib/server/current-user';
import { getDatabase } from '@/lib/server/database';
import { getGoal } from '@/lib/server/goals';

export const metadata: Metadata = { title: 'Edit goal' };

export default function EditGoalPage({ params }: PageProps<'/goals/[goalId]/edit'>) {
  return (
    <>
      <PageIntro
        eyebrow="Edit goal"
        title="Refine your goal."
        description="Update the title, description, or target date. Nothing changes until you choose Save changes."
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <EditGoal params={params} />
      </Suspense>
    </>
  );
}

async function EditGoal({ params }: Pick<PageProps<'/goals/[goalId]/edit'>, 'params'>) {
  const user = await requireUser();
  const { goalId } = await params;
  const goal = await getGoal(getDatabase(), user.id, goalId);
  if (!goal) {
    notFound();
  }
  return <GoalForm goal={goal} />;
}
