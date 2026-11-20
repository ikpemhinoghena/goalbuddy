import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link
          href="/"
          aria-label="GoalBuddy home"
          className="flex items-center gap-3 text-xl font-bold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg text-white"
          >
            g.
          </span>
          GoalBuddy
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-2 text-sm font-semibold sm:gap-4"
        >
          <Link href="/" className="rounded-lg px-3 py-2 hover:bg-surface">
            Home
          </Link>
          <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-surface">
            Workspace preview
          </Link>
          <Link href="/goals" className="rounded-lg px-3 py-2 hover:bg-surface">
            Goals preview
          </Link>
        </nav>
      </div>
    </header>
  );
}
