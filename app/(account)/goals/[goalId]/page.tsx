import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DeleteGoalDialog } from '@/components/goals/delete-goal-dialog';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageIntro } from '@/components/ui/page-intro';
import { buttonStyles } from '@/components/ui/styles';
import { formatDate, formatTimestamp, pluralize } from '@/lib/format';
import { requireUser } from '@/lib/server/current-user';
import { getDatabase } from '@/lib/server/database';
import { getGoal, getGoalPlanCounts } from '@/lib/server/goals';

export const metadata: Metadata = { title: 'Goal' };

export default function GoalPage({ params }: PageProps<'/goals/[goalId]'>) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <GoalDetail params={params} />
    </Suspense>
  );
}

async function GoalDetail({ params }: Pick<PageProps<'/goals/[goalId]'>, 'params'>) {
  const user = await requireUser();
  const { goalId } = await params;
  const db = getDatabase();
  const goal = await getGoal(db, user.id, goalId);
  const counts = goal ? await getGoalPlanCounts(db, user.id, goal.id) : null;
  if (!goal || !counts) {
    notFound();
  }
  return (
    <>
      <PageIntro eyebrow="Goal" title={goal.title}>
        <Link href={`/goals/${goal.id}/edit`} className={buttonStyles.primary}>
          Edit goal
        </Link>
        <DeleteGoalDialog
          goalId={goal.id}
          title={goal.title}
          revision={goal.revision}
          milestones={counts.milestones}
          tasks={counts.tasks}
        />
      </PageIntro>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section
          aria-labelledby="goal-description"
          className="rounded-2xl border border-border bg-white p-6 sm:p-8"
        >
          <h2 id="goal-description" className="text-xl font-semibold">
            Description
          </h2>
          <p className="mt-4 whitespace-pre-line break-words leading-7 text-muted">
            {goal.description || 'No description yet.'}
          </p>
        </section>
        <section aria-labelledby="goal-details" className="rounded-2xl bg-surface p-6 sm:p-8">
          <h2 id="goal-details" className="text-xl font-semibold">
            Details
          </h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-semibold">Target date</dt>
              <dd className="text-muted">
                {goal.targetDate ? formatDate(goal.targetDate) : 'None'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Plan</dt>
              <dd className="text-muted">
                {pluralize(counts.milestones, 'milestone')}, {pluralize(counts.tasks, 'task')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Created</dt>
              <dd className="text-muted">{formatTimestamp(goal.createdAt, user.timezone)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Last updated</dt>
              <dd className="text-muted">{formatTimestamp(goal.updatedAt, user.timezone)}</dd>
            </div>
          </dl>
        </section>
      </div>
      <p className="rounded-xl border border-border bg-accent-soft px-5 py-4 text-sm leading-6 text-primary-dark">
        Adding milestones and tasks to a goal is still in development.
      </p>
      <Link href="/goals" className="inline-block font-semibold text-primary hover:underline">
        Back to your goals
      </Link>
    </>
  );
}
