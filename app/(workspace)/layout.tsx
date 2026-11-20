import type { ReactNode } from 'react';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8 py-8 sm:py-12">
      <aside
        aria-label="Preview information"
        className="rounded-xl border border-border bg-accent-soft px-5 py-4 text-sm leading-6 text-primary-dark"
      >
        <strong>Design preview.</strong> This is an example of an empty workspace, not a signed-in
        account. No personal data is loaded or saved. Account access and goal editing are still in
        development.
      </aside>
      {children}
    </div>
  );
}
