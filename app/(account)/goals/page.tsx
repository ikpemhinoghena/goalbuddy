import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { GoalCard } from '@/components/goals/goal-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageIntro } from '@/components/ui/page-intro';
import { buttonStyles } from '@/components/ui/styles';
import { requireUser } from '@/lib/server/current-user';
import { getDatabase } from '@/lib/server/database';
import { listGoals } from '@/lib/server/goals';
import { encodeCursor, validateGoalListQuery } from '@/lib/validation/pagination';

export const metadata: Metadata = { title: 'Your goals' };

const pageSize = 24;

export default function GoalsPage({ searchParams }: PageProps<'/goals'>) {
  return (
    <>
      <PageIntro
        eyebrow="The big picture"
        title="Goals with room to grow."
        description="A dedicated place for the ambitions you want to make time for."
      >
        <Link href="/goals/new" className={buttonStyles.primary}>
          New goal
        </Link>
      </PageIntro>
      <Suspense fallback={<LoadingSkeleton />}>
        <GoalList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function GoalList({ searchParams }: Pick<PageProps<'/goals'>, 'searchParams'>) {
  const user = await requireUser();
  const { cursor } = await searchParams;
  const query = validateGoalListQuery(
    new URLSearchParams(typeof cursor === 'string' ? { cursor } : {}),
  );
  const olderPage = query.ok && query.value.cursor !== null;
  const page = await listGoals(getDatabase(), user.id, {
    limit: pageSize,
    cursor: query.ok ? query.value.cursor : null,
  });
  if (page.goals.length === 0) {
    return olderPage ? (
      <EmptyState
        title="No older goals"
        description="You have reached the end of your goals list."
        action={{ href: '/goals', label: 'Back to your newest goals' }}
      />
    ) : (
      <EmptyState
        title="A fresh start for your goals"
        description="Create your first goal to give an ambition a name, a description, and an optional target date."
        action={{ href: '/goals/new', label: 'Create your first goal' }}
      />
    );
  }
  return (
    <section aria-label="Your goals" className="space-y-6">
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {page.goals.map((goal) => (
          <li key={goal.id} className="grid">
            <GoalCard goal={goal} timeZone={user.timezone} />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        {olderPage ? (
          <Link href="/goals" className={buttonStyles.secondary}>
            Newest goals
          </Link>
        ) : null}
        {page.nextCursor ? (
          <Link
            href={`/goals?cursor=${encodeCursor(page.nextCursor)}`}
            className={buttonStyles.secondary}
          >
            Show older goals
          </Link>
        ) : null}
      </div>
    </section>
  );
}
