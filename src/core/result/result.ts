import type { AppError } from '@core/errors/app-error';

/**
 * A `Result` makes success and failure explicit in the type system.
 *
 * Application use cases return `Result<T>` instead of throwing, so callers are *forced* by the
 * compiler to handle the failure branch. This is the project's standard for any operation that
 * can fail for an expected reason (validation, auth, network). Truly unexpected/programmer
 * errors may still throw.
 */
export type Result<TValue, TError extends AppError = AppError> =
  | Success<TValue>
  | Failure<TError>;

export interface Success<TValue> {
  readonly ok: true;
  readonly value: TValue;
}

export interface Failure<TError extends AppError> {
  readonly ok: false;
  readonly error: TError;
}

export const ok = <TValue>(value: TValue): Success<TValue> => ({
  ok: true,
  value,
});

export const err = <TError extends AppError>(error: TError): Failure<TError> => ({
  ok: false,
  error,
});

export const isOk = <TValue, TError extends AppError>(
  result: Result<TValue, TError>,
): result is Success<TValue> => result.ok;

export const isErr = <TValue, TError extends AppError>(
  result: Result<TValue, TError>,
): result is Failure<TError> => !result.ok;

/** Transform the success value while preserving any failure unchanged. */
export const mapResult = <TValue, TNext, TError extends AppError>(
  result: Result<TValue, TError>,
  map: (value: TValue) => TNext,
): Result<TNext, TError> => (result.ok ? ok(map(result.value)) : result);
