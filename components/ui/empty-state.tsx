import Link from 'next/link';

type EmptyStateProps = {
  title: string;
  description: string;
  action: { href: string; label: string };
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center sm:px-12">
      <span
        aria-hidden="true"
        className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-surface text-2xl text-primary"
      >
        +
      </span>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 text-muted">{description}</p>
      <Link
        href={action.href}
        className="mt-6 inline-block rounded-xl border border-border px-5 py-3 font-semibold text-primary hover:bg-surface"
      >
        {action.label}
      </Link>
    </div>
  );
}
