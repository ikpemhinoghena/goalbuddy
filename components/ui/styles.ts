export const buttonStyles = {
  primary:
    'inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-5 py-3 font-semibold text-primary hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
  danger:
    'inline-flex min-h-11 items-center justify-center rounded-xl bg-error px-5 py-3 font-semibold text-white hover:bg-[#8f1c13] disabled:cursor-not-allowed disabled:opacity-60',
} as const;

export const fieldStyles =
  'block min-h-11 w-full rounded-xl border border-muted bg-white px-4 py-3 text-base text-foreground aria-invalid:border-error';
