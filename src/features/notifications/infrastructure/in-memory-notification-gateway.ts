import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Announcement,
  AnnouncementNotFoundError,
  type NotificationError,
  type NotificationGateway,
  type NotificationQueryParams,
  type NotificationStats,
  type PagedAnnouncementsResult,
} from '../domain';
import { ANNOUNCEMENT_SEED } from './announcement-seed';

export interface InMemoryNotificationGatewayDeps {
  readonly logger: Logger;
}

/** In-memory {@link NotificationGateway} seeded from the prototype. */
export class InMemoryNotificationGateway implements NotificationGateway {
  private readonly logger: Logger;
  private readonly announcements: Map<string, Announcement>;

  public constructor(deps: InMemoryNotificationGatewayDeps) {
    this.logger = deps.logger.child('notification-gateway');
    this.announcements = new Map(
      ANNOUNCEMENT_SEED.map((props) => [props.id, new Announcement(props)]),
    );
  }

  public list(): Promise<Result<readonly Announcement[], NotificationError>> {
    return Promise.resolve(ok([...this.announcements.values()]));
  }

  public listPaged(
    params: NotificationQueryParams,
  ): Promise<Result<PagedAnnouncementsResult, NotificationError>> {
    let items = [...this.announcements.values()];
    if (params.isRead !== undefined) {
      items = items.filter((a) => a.read === params.isRead);
    }
    if (params.topicId) {
      items = items.filter((a) => a.topicId === params.topicId);
    }
    const totalCount = items.length;
    const skip = params.skipCount ?? 0;
    const take = params.maxResultCount ?? 15;
    const paged = items.slice(skip, skip + take);

    return Promise.resolve(ok({ items: paged, totalCount }));
  }

  public getStats(): Promise<Result<NotificationStats, NotificationError>> {
    const items = [...this.announcements.values()];
    const totalCount = items.length;
    const readCount = items.filter((a) => a.read).length;
    const unreadCount = Math.max(0, totalCount - readCount);

    return Promise.resolve(ok({ totalCount, readCount, unreadCount }));
  }

  public markRead(id: string): Promise<Result<Announcement, NotificationError>> {
    const announcement = this.announcements.get(id);
    if (announcement === undefined) {
      this.logger.warn('Announcement not found', { id });
      return Promise.resolve(err(new AnnouncementNotFoundError(id)));
    }
    const updated = announcement.markRead();
    this.announcements.set(id, updated);
    return Promise.resolve(ok(updated));
  }

  public markAllRead(): Promise<Result<readonly Announcement[], NotificationError>> {
    for (const [id, announcement] of this.announcements) {
      this.announcements.set(id, announcement.markRead());
    }
    return Promise.resolve(ok([...this.announcements.values()]));
  }
}
