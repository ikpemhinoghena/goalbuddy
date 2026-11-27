import type { RefObject } from 'react';

type FormMessageProps = {
  tone: 'error' | 'success';
  message: string | null;
  ref?: RefObject<HTMLDivElement | null>;
};

export function FormMessage({ tone, message, ref }: FormMessageProps) {
  if (!message) {
    return null;
  }
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={tone === 'error' ? 'alert' : 'status'}
      className={
        tone === 'error'
          ? 'rounded-xl border border-error bg-white px-4 py-3 font-semibold text-error'
          : 'rounded-xl border border-primary bg-accent-soft px-4 py-3 font-semibold text-primary-dark'
      }
    >
      {message}
    </div>
  );
}
