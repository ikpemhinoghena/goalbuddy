import type { ISODate } from '@/lib/models';
import {
  combineFields,
  isRecord,
  objectRequired,
  optionalDate,
  optionalText,
  rejectUnknownFields,
  requiredText,
  revisionField,
  textLimits,
  type Validation,
} from './fields';

export type GoalInput = {
  title: string;
  description: string;
  targetDate: ISODate | null;
};

export type GoalUpdateInput = GoalInput & { revision: number };

const goalFields = ['title', 'description', 'targetDate'] as const;

function goalFieldResults(input: Record<string, unknown>) {
  return {
    title: requiredText(input.title, 'Title', textLimits.title),
    description: optionalText(input.description, 'Description', textLimits.description),
    targetDate: optionalDate(input.targetDate, 'Target date'),
  };
}

export function validateGoalCreate(input: unknown): Validation<GoalInput> {
  if (!isRecord(input)) {
    return objectRequired();
  }
  return combineFields(goalFieldResults(input), rejectUnknownFields(input, goalFields));
}

export function validateGoalUpdate(input: unknown): Validation<GoalUpdateInput> {
  if (!isRecord(input)) {
    return objectRequired();
  }
  return combineFields(
    { ...goalFieldResults(input), revision: revisionField(input.revision) },
    rejectUnknownFields(input, [...goalFields, 'revision']),
  );
}

export function validateGoalDelete(input: unknown): Validation<{ revision: number }> {
  if (!isRecord(input)) {
    return objectRequired();
  }
  return combineFields(
    { revision: revisionField(input.revision) },
    rejectUnknownFields(input, ['revision']),
  );
}
