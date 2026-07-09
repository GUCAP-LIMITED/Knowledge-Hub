import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Announcement, NotificationError, NotificationGateway } from '../../domain';

export interface MarkAnnouncementReadUseCaseDeps {
  readonly notificationGateway: NotificationGateway;
  readonly logger: Logger;
}

/** Mark one announcement as read. */
export class MarkAnnouncementReadUseCase {
  private readonly notificationGateway: NotificationGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkAnnouncementReadUseCaseDeps) {
    this.notificationGateway = deps.notificationGateway;
    this.logger = deps.logger.child('mark-announcement-read');
  }

  public async execute(id: string): Promise<Result<Announcement, NotificationError>> {
    const result = await this.notificationGateway.markRead(id);
    if (isErr(result)) {
      this.logger.warn('Marking announcement read failed', {
        code: result.error.code,
        id,
      });
    }
    return result;
  }
}
