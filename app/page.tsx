import Link from 'next/link';

const steps = [
  [
    'Choose a meaningful goal',
    'Give your ambition a name and a direction. Set a target date when it helps.',
  ],
  [
    'Make room for small steps',
    'Break your goal into milestones and manageable tasks that fit your day.',
  ],
  [
    'See how far you have come',
    'Let completed tasks tell the story. Revisit your plan as life changes.',
  ],
];

export default function Home() {
  return (
    <div className="space-y-16 py-10 sm:py-16">
      <section
        className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]"
        aria-labelledby="home-title"
      >
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-primary">
            A little structure. A lot of possibility.
          </p>
          <h1
            id="home-title"
            className="max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl"
          >
            Big goals.
            <br />
            Small steps.
            <br />
            <span className="text-primary">Steady progress.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            A calmer way to turn what matters to you into a plan you can follow. GoalBuddy brings
            your goals, milestones, and daily tasks into one focused space.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
            >
              Explore the workspace preview
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-border bg-white px-6 py-3 font-semibold hover:bg-surface"
            >
              How it works
            </a>
          </div>
          <p className="mt-5 max-w-lg text-sm leading-6 text-muted">
            GoalBuddy is in development. Sign in with GitHub to create and manage goals; milestones,
            tasks, and progress tracking are coming next.
          </p>
        </div>
        <aside
          className="rounded-3xl border border-border bg-white p-7 shadow-sm sm:p-10"
          aria-labelledby="plan-title"
        >
          <h2 id="plan-title" className="mb-8 text-xl font-semibold">
            A plan that grows with you
          </h2>
          <ol className="space-y-7">
            {steps.map(([title, detail], index) => (
              <li key={title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface font-semibold text-primary"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 leading-7 text-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 border-t border-border pt-6 text-sm leading-6 text-muted">
            Your pace. Your priorities. Your next step.
          </p>
        </aside>
      </section>
      <section
        id="how-it-works"
        aria-labelledby="features-title"
        className="scroll-mt-6 border-t border-border pt-12"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Built around your progress
        </p>
        <h2 id="features-title" className="mt-3 text-3xl font-semibold tracking-tight">
          Less overwhelm. More direction.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              'Keep the big picture',
              'A home for your academic, professional, and personal ambitions, with room for details and optional deadlines.',
            ],
            [
              'Focus on the next step',
              'Milestones organize the journey. Tasks make it practical. Progress will follow the work you actually complete.',
            ],
            [
              'Stay in control',
              'Plan manually from the start. Optional AI roadmaps are planned for a later release, always yours to review and change.',
            ],
          ].map(([title, detail]) => (
            <article key={title} className="rounded-2xl bg-surface p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-muted">{detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
