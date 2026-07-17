import { DomainError } from '@core/errors';

/** Base type for every dashboard-domain failure. Lets callers catch/switch on intent. */
export abstract class DashboardError extends DomainError {}

/** The dashboard API could not be reached or returned an unexpected response. */
export class DashboardUnavailableError extends DashboardError {
  public readonly code = 'DASHBOARD_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The dashboard service is currently unavailable. Please try again.', { cause });
  }
}

/** A dashboard write was rejected by the backend (e.g. invalid widget or config). */
export class DashboardOperationError extends DashboardError {
  public readonly code = 'DASHBOARD_OPERATION_REJECTED';

  public constructor(message: string) {
    super(message);
  }
}
