import type { ReactNode } from 'react';

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="mt-3 break-words text-4xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-4 leading-7 text-muted">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}
