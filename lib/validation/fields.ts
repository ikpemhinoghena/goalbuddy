import type { ISODate } from '@/lib/models';

export type FieldErrors = Record<string, string>;

export type Validation<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

export type FieldResult<T> = { value: T } | { error: string };

type FieldResults = Record<string, FieldResult<unknown>>;

type FieldValues<F extends FieldResults> = {
  [K in keyof F]: F[K] extends FieldResult<infer V> ? V : never;
};

export const textLimits = { title: 120, description: 5000, displayName: 80 } as const;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const timezonePattern = /^[A-Za-z][A-Za-z_]*(?:\/[A-Za-z0-9_+-]+)*$/;

export function characterCount(value: string): number {
  return Array.from(value).length;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export function isValidDate(value: string): boolean {
  const match = datePattern.exec(value);
  if (!match) {
    return false;
  }
  const [year, month, day] = match.slice(1).map(Number);
  if (year < 1) {
    return false;
  }
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function isValidTimezone(value: string): boolean {
  if (value.length > 64 || !timezonePattern.test(value)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function requiredText(value: unknown, label: string, max: number): FieldResult<string> {
  if (typeof value !== 'string' || value.trim() === '') {
    return { error: `${label} is required.` };
  }
  const trimmed = value.trim();
  if (characterCount(trimmed) > max) {
    return { error: `${label} must be ${max.toLocaleString('en-US')} characters or fewer.` };
  }
  return { value: trimmed };
}

export function optionalText(value: unknown, label: string, max: number): FieldResult<string> {
  if (value === undefined || value === null) {
    return { value: '' };
  }
  if (typeof value !== 'string') {
    return { error: `${label} must be text.` };
  }
  const trimmed = value.trim();
  if (characterCount(trimmed) > max) {
    return { error: `${label} must be ${max.toLocaleString('en-US')} characters or fewer.` };
  }
  return { value: trimmed };
}

export function optionalDate(value: unknown, label: string): FieldResult<ISODate | null> {
  if (value === undefined || value === null || value === '') {
    return { value: null };
  }
  if (typeof value !== 'string' || !isValidDate(value)) {
    return { error: `${label} must be a valid date.` };
  }
  return { value };
}

export function revisionField(value: unknown): FieldResult<number> {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    return { error: 'Revision must be a positive whole number.' };
  }
  return { value };
}

export function timezoneField(value: unknown): FieldResult<string> {
  if (typeof value !== 'string' || !isValidTimezone(value)) {
    return { error: 'Choose a valid time zone.' };
  }
  return { value };
}

export function rejectUnknownFields(
  input: Record<string, unknown>,
  allowed: readonly string[],
): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of Object.keys(input)) {
    if (!allowed.includes(key)) {
      errors[key] = 'This field is not accepted.';
    }
  }
  return errors;
}

export function combineFields<F extends FieldResults>(
  fields: F,
  extraErrors: FieldErrors = {},
): Validation<FieldValues<F>> {
  const errors: FieldErrors = { ...extraErrors };
  const values: Record<string, unknown> = {};
  for (const [key, result] of Object.entries(fields)) {
    if ('error' in result) {
      errors[key] = result.error;
    } else {
      values[key] = result.value;
    }
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: values as FieldValues<F> };
}

export function objectRequired<T>(): Validation<T> {
  return { ok: false, errors: { body: 'The request body must be a JSON object.' } };
}
