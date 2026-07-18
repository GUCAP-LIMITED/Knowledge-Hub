import { type Result, ok, err } from '@core/result';
import { RequiredFieldError } from '../domain';

/**
 * A `domainResolver` field validator that rejects an empty/whitespace-only value. The success
 * value is echoed back unchanged (the resolver ignores it); the error carries the field label so
 * the inline message reads "<label> is required."
 */
export const required =
  (label: string) =>
  (value: string): Result<string, RequiredFieldError> =>
    value.trim().length > 0 ? ok(value) : err(new RequiredFieldError(label));
