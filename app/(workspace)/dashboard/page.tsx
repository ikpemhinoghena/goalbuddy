import type { Metadata } from 'next';
import { DashboardSummary } from '@/components/dashboard-summary';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Workspace preview' };

export default function DashboardPage() {
  return (
    <>
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Your workspace
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Room for your next chapter.</h1>
        <p className="mt-4 leading-7 text-muted">
          A simple overview designed to keep your goals and next steps in sight.
        </p>
      </div>
      <DashboardSummary />
      <EmptyState
        title="Every plan starts with one goal"
        description="Your saved goals and task progress will live here once account access is available. For now, explore how an empty goals list will look."
        action={{ href: '/goals', label: 'View the goals preview' }}
      />
    </>
  );
}
