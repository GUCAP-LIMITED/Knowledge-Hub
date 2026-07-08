import type { FieldError, FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import { type Result, isErr } from '@core/result';

/**
 * Validates one raw field value by delegating to a domain value object's `create`, which returns a
 * `Result`. The success value is ignored here — the use case re-creates the value object as the
 * authoritative check; this resolver only mirrors that rule for inline UX feedback.
 */
export type FieldValidator<TValue> = (value: TValue) => Result<unknown>;

/** A partial map of form field name → the domain validator that guards it. */
export type FieldValidators<TFieldValues extends FieldValues> = {
  readonly [K in keyof TFieldValues]?: FieldValidator<TFieldValues[K]>;
};

/**
 * A react-hook-form `resolver` whose validation rules ARE the domain value objects — the same
 * `XxxTitle.create` / `Email.create` the use cases call. Use it instead of a Zod form schema so the
 * domain stays the single source of truth ("what is valid" lives in one place):
 *
 * ```ts
 * useForm<{ title: string }>({
 *   resolver: domainResolver<{ title: string }>({ title: TaskTitle.create }),
 * });
 * ```
 *
 * A field's `Result` error becomes that field's `message` (and `type` = the error `code`).
 */
export function domainResolver<TFieldValues extends FieldValues>(
  validators: FieldValidators<TFieldValues>,
): Resolver<TFieldValues> {
  return (values) => {
    const errors: Partial<Record<keyof TFieldValues, FieldError>> = {};

    for (const key of Object.keys(validators) as (keyof TFieldValues)[]) {
      // The per-key validator type is sound by construction; widen for the call so we don't fight
      // the union-of-functions over `keyof TFieldValues`.
      const validate = validators[key] as FieldValidator<unknown> | undefined;
      if (validate === undefined) {
        continue;
      }
      const result = validate(values[key]);
      if (isErr(result)) {
        errors[key] = { type: result.error.code, message: result.error.message };
      }
    }

    if (Object.keys(errors).length > 0) {
      return { values: {}, errors: errors as FieldErrors<TFieldValues> };
    }
    return { values, errors: {} };
  };
}
