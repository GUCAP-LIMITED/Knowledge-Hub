import { DomainError } from '@core/errors';

/** Base type for every notifications-domain failure. */
export abstract class NotificationError extends DomainError {}

/** The notifications source could not be reached or returned an unexpected response. */
export class NotificationsUnavailableError extends NotificationError {
  public readonly code = 'NOTIFICATIONS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('Notifications are currently unavailable. Please try again.', { cause });
  }
}

/** No announcement exists for the given id. */
export class AnnouncementNotFoundError extends NotificationError {
  public readonly code = 'NOTIFICATIONS_NOT_FOUND';

  public constructor(id: string) {
    super(`No announcement found for id "${id}".`, { context: { id } });
  }
}
