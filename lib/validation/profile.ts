import {
  combineFields,
  isRecord,
  objectRequired,
  rejectUnknownFields,
  requiredText,
  revisionField,
  textLimits,
  timezoneField,
  type Validation,
} from './fields';

export type ProfileUpdateInput = {
  displayName: string;
  timezone: string;
  revision: number;
};

export function validateProfileUpdate(input: unknown): Validation<ProfileUpdateInput> {
  if (!isRecord(input)) {
    return objectRequired();
  }
  return combineFields(
    {
      displayName: requiredText(input.displayName, 'Display name', textLimits.displayName),
      timezone: timezoneField(input.timezone),
      revision: revisionField(input.revision),
    },
    rejectUnknownFields(input, ['displayName', 'timezone', 'revision']),
  );
}
