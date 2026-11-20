import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Goals preview' };

export default function GoalsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          The big picture
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Goals with room to grow.</h1>
        <p className="mt-4 leading-7 text-muted">
          A dedicated place for the ambitions you want to make time for.
        </p>
      </div>
      <EmptyState
        title="A fresh start for your goals"
        description="This empty-list design shows where your plans will appear. Goal creation, editing, and saving will be available after secure account access is connected."
        action={{ href: '/dashboard', label: 'Back to the workspace preview' }}
      />
    </>
  );
}
