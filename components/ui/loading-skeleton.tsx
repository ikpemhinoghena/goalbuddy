export function LoadingSkeleton() {
  return (
    <div role="status" className="space-y-5 py-12">
      <span className="sr-only">Loading GoalBuddy content</span>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="h-10 w-2/3 rounded-xl bg-surface" />
        <div className="h-5 w-1/2 rounded-xl bg-surface" />
        <div className="h-48 rounded-2xl bg-surface" />
      </div>
    </div>
  );
}
