import { type Result, ok } from '@core/result';
import type {
  Announcement,
  NotificationError,
  NotificationGateway,
  NotificationQueryParams,
  NotificationStats,
  PagedAnnouncementsResult,
} from '@features/notifications/domain';
import { buildAnnouncement } from '../builders/announcement.builder';

/** Hand-written, fully-typed fake of the {@link NotificationGateway} port. */
export class FakeNotificationGateway implements NotificationGateway {
  public listResult: Result<readonly Announcement[], NotificationError> = ok([]);
  public pagedResult: Result<PagedAnnouncementsResult, NotificationError> | null = null;
  public statsResult: Result<NotificationStats, NotificationError> | null = null;
  public markReadResult: Result<Announcement, NotificationError> = ok(
    buildAnnouncement({ read: true }),
  );
  public markAllReadResult: Result<readonly Announcement[], NotificationError> = ok([]);

  public lastReadId: string | null = null;
  public lastQueryParams: NotificationQueryParams | null = null;

  public list(): Promise<Result<readonly Announcement[], NotificationError>> {
    return Promise.resolve(this.listResult);
  }

  public listPaged(
    params: NotificationQueryParams,
  ): Promise<Result<PagedAnnouncementsResult, NotificationError>> {
    this.lastQueryParams = params;
    if (this.pagedResult) {
      return Promise.resolve(this.pagedResult);
    }
    if (!this.listResult.ok) {
      return Promise.resolve(this.listResult);
    }
    let items = [...this.listResult.value];
    if (params.isRead !== undefined) {
      items = items.filter((a) => a.read === params.isRead);
    }
    const totalCount = items.length;
    const skip = params.skipCount ?? 0;
    const take = params.maxResultCount ?? 15;
    return Promise.resolve(ok({ items: items.slice(skip, skip + take), totalCount }));
  }

  public getStats(): Promise<Result<NotificationStats, NotificationError>> {
    if (this.statsResult) {
      return Promise.resolve(this.statsResult);
    }
    if (!this.listResult.ok) {
      return Promise.resolve(this.listResult);
    }
    const items = this.listResult.value;
    const totalCount = items.length;
    const readCount = items.filter((a) => a.read).length;
    const unreadCount = Math.max(0, totalCount - readCount);
    return Promise.resolve(ok({ totalCount, readCount, unreadCount }));
  }

  public markRead(id: string): Promise<Result<Announcement, NotificationError>> {
    this.lastReadId = id;
    return Promise.resolve(this.markReadResult);
  }

  public markAllRead(): Promise<Result<readonly Announcement[], NotificationError>> {
    return Promise.resolve(this.markAllReadResult);
  }
}
