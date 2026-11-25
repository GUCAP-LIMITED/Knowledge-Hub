import type { Result } from '@core/result';
import type { NotificationError } from '../errors/notification-errors';
import type { Announcement } from '../entities/announcement';
import type { NotificationStats } from '../entities/notification-stats';
import type { PagedAnnouncementsResult } from '../entities/paged-announcements';

export interface NotificationQueryParams {
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
  readonly isRead?: boolean | undefined;
  readonly topicId?: string | undefined;
  readonly sorting?: string | undefined;
}

/** Port to the notifications store. */
export interface NotificationGateway {
  list(): Promise<Result<readonly Announcement[], NotificationError>>;
  listPaged(
    params: NotificationQueryParams,
  ): Promise<Result<PagedAnnouncementsResult, NotificationError>>;
  getStats(): Promise<Result<NotificationStats, NotificationError>>;
  markRead(id: string): Promise<Result<Announcement, NotificationError>>;
  markAllRead(): Promise<Result<readonly Announcement[], NotificationError>>;
}
