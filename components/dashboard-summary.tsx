export function DashboardSummary() {
  return (
    <dl className="grid gap-4 sm:grid-cols-3" aria-label="Empty workspace design preview">
      {[
        ['Goals', 'Your bigger picture'],
        ['Completed tasks', 'Small steps that add up'],
        ['Tasks remaining', 'A little focus for what is next'],
      ].map(([label, detail]) => (
        <div key={label} className="rounded-2xl border border-border bg-white p-6">
          <dt className="font-medium text-muted">{label}</dt>
          <dd className="mt-3 text-4xl font-semibold">
            0<span className="sr-only"> in this empty design preview</span>
          </dd>
          <dd className="mt-3 text-sm text-muted">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
