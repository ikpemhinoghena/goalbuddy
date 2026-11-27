import type { Metadata } from 'next';
import { DashboardSummary } from '@/components/dashboard-summary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageIntro } from '@/components/ui/page-intro';

export const metadata: Metadata = { title: 'Workspace preview' };

export default function DashboardPage() {
  return (
    <>
      <PageIntro
        eyebrow="Your workspace"
        title="Room for your next chapter."
        description="A simple overview designed to keep your goals and next steps in sight."
      />
      <DashboardSummary />
      <EmptyState
        title="Every plan starts with one goal"
        description="Task progress will appear here once milestones and tasks are available. You can already sign in to create and manage your goals."
        action={{ href: '/goals', label: 'Go to your goals' }}
      />
    </>
  );
}
