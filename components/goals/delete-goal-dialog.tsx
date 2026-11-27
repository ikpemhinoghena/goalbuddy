'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { readApiError } from '@/lib/api-contract';
import { pluralize } from '@/lib/format';
import { FormMessage } from '@/components/ui/form-message';
import { buttonStyles } from '@/components/ui/styles';

type DeleteGoalDialogProps = {
  goalId: string;
  title: string;
  revision: number;
  milestones: number;
  tasks: number;
};

export function DeleteGoalDialog({
  goalId,
  title,
  revision,
  milestones,
  tasks,
}: DeleteGoalDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function open() {
    setMessage(null);
    dialogRef.current?.showModal();
  }

  async function confirmDelete() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision }),
      });
      if (response.ok) {
        dialogRef.current?.close();
        router.push('/goals');
        router.refresh();
        return;
      }
      const failure = readApiError(await response.json().catch(() => null));
      setMessage(
        response.status === 404
          ? 'This goal no longer exists.'
          : (failure?.message ?? 'The goal was not deleted. Please try again.'),
      );
    } catch {
      setMessage('The goal was not deleted because the connection failed. Please try again.');
    }
    setPending(false);
  }

  return (
    <>
      <button ref={triggerRef} type="button" onClick={open} className={buttonStyles.secondary}>
        Delete goal
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-goal-title"
        aria-describedby="delete-goal-impact"
        onClose={() => triggerRef.current?.focus()}
        className="m-auto w-[min(32rem,calc(100%-2.5rem))] rounded-2xl border border-border bg-white p-6 text-foreground shadow-xl backdrop:bg-foreground/50 sm:p-8"
      >
        <h2 id="delete-goal-title" className="text-2xl font-semibold">
          Delete this goal?
        </h2>
        <p id="delete-goal-impact" className="mt-4 break-words leading-7 text-muted">
          “{title}” will be permanently deleted, along with {pluralize(milestones, 'milestone')} and{' '}
          {pluralize(tasks, 'task')}. This cannot be undone.
        </p>
        <div className="mt-5">
          <FormMessage tone="error" message={message} />
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => dialogRef.current?.close()}
            className={buttonStyles.secondary}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={confirmDelete}
            className={buttonStyles.danger}
          >
            {pending ? 'Deleting…' : 'Delete goal'}
          </button>
        </div>
      </dialog>
    </>
  );
}
