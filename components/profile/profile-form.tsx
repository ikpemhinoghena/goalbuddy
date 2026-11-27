'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { hasProfile, readApiError, type Profile } from '@/lib/api-contract';
import { textLimits, type FieldErrors } from '@/lib/validation/fields';
import { validateProfileUpdate } from '@/lib/validation/profile';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { buttonStyles, fieldStyles } from '@/components/ui/styles';

type ProfileFormProps = {
  profile: Pick<Profile, 'displayName' | 'timezone' | 'revision'>;
  timezones: string[];
};

export function ProfileForm({ profile, timezones }: ProfileFormProps) {
  const router = useRouter();
  const messageRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState({
    displayName: profile.displayName,
    timezone: profile.timezone,
  });
  const [revision, setRevision] = useState(profile.revision);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  function show(tone: 'error' | 'success', text: string, fields: FieldErrors = {}) {
    setErrors(fields);
    setResult({ tone, text });
    requestAnimationFrame(() => messageRef.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...values, revision };
    const local = validateProfileUpdate(payload);
    if (!local.ok) {
      show('error', 'Your profile was not saved. Check the highlighted fields.', local.errors);
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(local.value),
      });
      const body: unknown = await response.json().catch(() => null);
      if (response.ok && hasProfile(body)) {
        setRevision(body.profile.revision);
        setValues({ displayName: body.profile.displayName, timezone: body.profile.timezone });
        show('success', 'Your profile was saved.');
        router.refresh();
      } else {
        const failure = readApiError(body);
        show(
          'error',
          response.status === 401
            ? 'Your session has ended. Sign in again to save your profile.'
            : (failure?.message ?? 'Your profile was not saved. Please try again.'),
          failure?.fields,
        );
      }
    } catch {
      show('error', 'Your profile was not saved because the connection failed. Please try again.');
    }
    setPending(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <FormMessage tone={result?.tone ?? 'error'} message={result?.text ?? null} ref={messageRef} />
      <FormField id="profile-display-name" label="Display name" required error={errors.displayName}>
        {(control) => (
          <input
            {...control}
            name="displayName"
            type="text"
            required
            autoComplete="nickname"
            maxLength={textLimits.displayName}
            value={values.displayName}
            onChange={(event) => setValues({ ...values, displayName: event.target.value })}
            className={fieldStyles}
          />
        )}
      </FormField>
      <FormField
        id="profile-timezone"
        label="Time zone"
        hint="Used to show dates and times in your local time."
        required
        error={errors.timezone}
      >
        {(control) => (
          <select
            {...control}
            name="timezone"
            value={values.timezone}
            onChange={(event) => setValues({ ...values, timezone: event.target.value })}
            className={`${fieldStyles} sm:max-w-sm`}
          >
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <button type="submit" disabled={pending} className={buttonStyles.primary}>
        {pending ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
