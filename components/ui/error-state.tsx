type ErrorStateProps = { retry: () => void };

export function ErrorState({ retry }: ErrorStateProps) {
  return (
    <div role="alert" className="my-12 rounded-2xl border border-border bg-white p-8">
      <h1 className="text-2xl font-semibold">We could not load this page</h1>
      <p className="mt-3 leading-7 text-muted">
        Please try again. If the problem continues, return to the homepage.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark"
      >
        Try again
      </button>
    </div>
  );
}
