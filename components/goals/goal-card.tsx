import Link from 'next/link';
import { formatDate, formatTimestamp } from '@/lib/format';
import type { Goal } from '@/lib/models';

type GoalCardProps = { goal: Goal; timeZone: string };

export function GoalCard({ goal, timeZone }: GoalCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-white p-6">
      <h2 className="break-words text-xl font-semibold">
        <Link href={`/goals/${goal.id}`} className="rounded hover:text-primary">
          {goal.title}
        </Link>
      </h2>
      {goal.description ? (
        <p className="mt-3 line-clamp-3 whitespace-pre-line break-words leading-7 text-muted">
          {goal.description}
        </p>
      ) : null}
      <dl className="mt-5 space-y-1 text-sm text-muted">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-foreground">Target date:</dt>
          <dd>{goal.targetDate ? formatDate(goal.targetDate) : 'None'}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-foreground">Created:</dt>
          <dd>{formatTimestamp(goal.createdAt, timeZone)}</dd>
        </div>
      </dl>
    </article>
  );
}
