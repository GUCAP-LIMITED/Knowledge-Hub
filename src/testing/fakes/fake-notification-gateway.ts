import { type Result, ok } from '@core/result';
import type {
  Announcement,
  NotificationError,
  NotificationGateway,
} from '@features/notifications/domain';
import { buildAnnouncement } from '../builders/announcement.builder';

/** Hand-written, fully-typed fake of the {@link NotificationGateway} port. */
export class FakeNotificationGateway implements NotificationGateway {
  public listResult: Result<readonly Announcement[], NotificationError> = ok([]);
  public markReadResult: Result<Announcement, NotificationError> = ok(
    buildAnnouncement({ read: true }),
  );
  public markAllReadResult: Result<readonly Announcement[], NotificationError> = ok([]);

  public lastReadId: string | null = null;

  public list(): Promise<Result<readonly Announcement[], NotificationError>> {
    return Promise.resolve(this.listResult);
  }

  public markRead(id: string): Promise<Result<Announcement, NotificationError>> {
    this.lastReadId = id;
    return Promise.resolve(this.markReadResult);
  }

  public markAllRead(): Promise<Result<readonly Announcement[], NotificationError>> {
    return Promise.resolve(this.markAllReadResult);
  }
}
