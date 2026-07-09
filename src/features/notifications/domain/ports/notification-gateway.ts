import type { Result } from '@core/result';
import type { NotificationError } from '../errors/notification-errors';
import type { Announcement } from '../entities/announcement';

/** Port to the notifications store. */
export interface NotificationGateway {
  list(): Promise<Result<readonly Announcement[], NotificationError>>;
  markRead(id: string): Promise<Result<Announcement, NotificationError>>;
  markAllRead(): Promise<Result<readonly Announcement[], NotificationError>>;
}
