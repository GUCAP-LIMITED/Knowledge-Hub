import { type Result, ok, err } from '@core/result';
import { FieldLengthError, InvalidTagsError, RequiredFieldError } from '../domain';

/**
 * A `domainResolver` field validator that rejects an empty/whitespace-only value. The success
 * value is echoed back unchanged (the resolver ignores it); the error carries the field label so
 * the inline message reads "<label> is required."
 */
export const required =
  (label: string) =>
  (value: string): Result<string, RequiredFieldError> =>
    value.trim().length > 0 ? ok(value) : err(new RequiredFieldError(label));

export const maxLength =
  (label: string, max: number) =>
  (value: string | undefined): Result<string, FieldLengthError> => {
    const val = value ?? '';
    return val.length <= max ? ok(val) : err(new FieldLengthError(label, max));
  };

export const requiredWithMaxLength =
  (label: string, max: number) =>
  (value: string | undefined): Result<string, RequiredFieldError | FieldLengthError> => {
    const val = value ?? '';
    if (val.trim().length === 0) {
      return err(new RequiredFieldError(label));
    }
    return val.length <= max ? ok(val) : err(new FieldLengthError(label, max));
  };

export const validateTags = (
  value: string | undefined,
): Result<string, InvalidTagsError> => {
  const raw = value ?? '';
  if (!raw.trim()) {
    return ok(raw);
  }
  const tags = raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  for (const tag of tags) {
    if (tag.length > 80) {
      return err(
        new InvalidTagsError(`Tag "${tag}" exceeds the maximum allowed 80 characters.`),
      );
    }
  }
  return ok(raw);
};
