/**
 * Time abstraction. Never call `new Date()` directly in domain/application code — depend on a
 * `Clock` so behaviour around token expiry, timeouts, etc. is deterministic and testable.
 */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}

/** Test double: returns a fixed, optionally advanceable instant. */
export class FixedClock implements Clock {
  public constructor(private current: Date) {}

  public now(): Date {
    return this.current;
  }

  public set(next: Date): void {
    this.current = next;
  }

  public advanceSeconds(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}
