/**
 * Root of the application error hierarchy.
 *
 * Every error we *intend* to throw or surface derives from this. That gives us a single,
 * type-safe place to attach a stable machine-readable `code`, structured `context`, and a
 * `cause` chain — instead of throwing bare strings or untyped `Error`s.
 *
 * Rules:
 *  - Never `throw new Error('...')`. Throw a concrete subclass.
 *  - Never swallow errors. Wrap them with `cause` so the chain is preserved.
 */
export abstract class AppError extends Error {
  /** Stable, machine-readable identifier (e.g. `HTTP`, `CONFIG_INVALID`). */
  public abstract readonly code: string;

  /** Optional structured data for logging/telemetry. Never put secrets here. */
  public readonly context?: Readonly<Record<string, unknown>>;

  public constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly context?: Record<string, unknown> },
  ) {
    super(message);
    // `new.target` is the concrete subclass — gives a useful name in stack traces.
    this.name = new.target.name;

    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
    if (options?.context !== undefined) {
      this.context = Object.freeze({ ...options.context });
    }

    // Restore the prototype chain (required when targeting ES5/2015 transpilation).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Configuration could not be loaded or validated. Thrown only at startup (fail fast). */
export class ConfigError extends AppError {
  public readonly code = 'CONFIG_INVALID';
}

/** An unexpected, non-recoverable error. Use when no more specific type applies. */
export class UnexpectedError extends AppError {
  public readonly code = 'UNEXPECTED';

  public static from(cause: unknown): UnexpectedError {
    if (cause instanceof UnexpectedError) {
      return cause;
    }
    const message =
      cause instanceof Error ? cause.message : 'An unexpected error occurred.';
    return new UnexpectedError(message, { cause });
  }
}

/**
 * Base class for *domain* rule violations. Feature domains extend this so business errors
 * are distinguishable from infrastructure failures and can be mapped to friendly messages.
 */
export abstract class DomainError extends AppError {}
