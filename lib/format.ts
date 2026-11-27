import type { ISODate, ISOTimestamp } from '@/lib/models';

export function formatDate(value: ISODate): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function formatTimestamp(value: ISOTimestamp, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(value));
}

export function pluralize(count: number, singular: string, plural: string = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
