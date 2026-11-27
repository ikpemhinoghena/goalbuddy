'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { hasGoal, readApiError } from '@/lib/api-contract';
import type { Goal } from '@/lib/models';
import { textLimits, type FieldErrors } from '@/lib/validation/fields';
import { validateGoalCreate, validateGoalUpdate } from '@/lib/validation/goal';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { buttonStyles, fieldStyles } from '@/components/ui/styles';

type GoalFormProps = {
  goal?: Pick<Goal, 'id' | 'title' | 'description' | 'targetDate' | 'revision'>;
};

function failureMessage(status: number, fallback: string | undefined): string {
  if (status === 401) {
    return 'Your session has ended. Sign in again, then save your goal. Your entries are still here.';
  }
  if (status === 404) {
    return 'This goal no longer exists, so your changes were not saved.';
  }
  return fallback ?? 'Your goal was not saved. Please try again.';
}

export function GoalForm({ goal }: GoalFormProps) {
  const router = useRouter();
  const messageRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState({
    title: goal?.title ?? '',
    description: goal?.description ?? '',
    targetDate: goal?.targetDate ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function showFailure(text: string, fields: FieldErrors = {}) {
    setErrors(fields);
    setMessage(text);
    requestAnimationFrame(() => messageRef.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      title: values.title,
      description: values.description,
      targetDate: values.targetDate || null,
      ...(goal ? { revision: goal.revision } : {}),
    };
    const local = goal ? validateGoalUpdate(payload) : validateGoalCreate(payload);
    if (!local.ok) {
      showFailure('Your goal was not saved. Check the highlighted fields.', local.errors);
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch(goal ? `/api/goals/${goal.id}` : '/api/goals', {
        method: goal ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body: unknown = await response.json().catch(() => null);
      if (response.ok && hasGoal(body)) {
        router.push(`/goals/${body.goal.id}`);
        router.refresh();
        return;
      }
      const failure = readApiError(body);
      showFailure(failureMessage(response.status, failure?.message), failure?.fields);
    } catch {
      showFailure('Your goal was not saved because the connection failed. Please try again.');
    }
    setPending(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <FormMessage tone="error" message={message} ref={messageRef} />
      <FormField id="goal-title" label="Title" required error={errors.title}>
        {(control) => (
          <input
            {...control}
            name="title"
            type="text"
            required
            maxLength={textLimits.title}
            value={values.title}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
            className={fieldStyles}
          />
        )}
      </FormField>
      <FormField
        id="goal-description"
        label="Description"
        hint={`Optional. Up to ${textLimits.description.toLocaleString('en-US')} characters.`}
        error={errors.description}
      >
        {(control) => (
          <textarea
            {...control}
            name="description"
            rows={6}
            maxLength={textLimits.description}
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
            className={fieldStyles}
          />
        )}
      </FormField>
      <FormField
        id="goal-target-date"
        label="Target date"
        hint="Optional. Past dates are allowed."
        error={errors.targetDate}
      >
        {(control) => (
          <input
            {...control}
            name="targetDate"
            type="date"
            value={values.targetDate}
            onChange={(event) => setValues({ ...values, targetDate: event.target.value })}
            className={`${fieldStyles} sm:max-w-xs`}
          />
        )}
      </FormField>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? 'Saving…' : goal ? 'Save changes' : 'Create goal'}
        </button>
        <Link href={goal ? `/goals/${goal.id}` : '/goals'} className={buttonStyles.secondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
