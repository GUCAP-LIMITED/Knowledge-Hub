import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Announcement,
  AnnouncementNotFoundError,
  type NotificationError,
  type NotificationGateway,
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
