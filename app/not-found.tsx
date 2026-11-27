import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-20">
      <p className="font-semibold text-primary">404 · Page not found</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Let’s find your way back.</h1>
      <p className="mt-4 max-w-lg leading-7 text-muted">
        This page is not available. You can explore GoalBuddy from the homepage.
      </p>
      <Link
        href="/"
        className="mt-7 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark"
      >
        Return home
      </Link>
    </div>
  );
}
