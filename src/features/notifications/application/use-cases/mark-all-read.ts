import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Announcement, NotificationError, NotificationGateway } from '../../domain';

export interface MarkAllReadUseCaseDeps {
  readonly notificationGateway: NotificationGateway;
  readonly logger: Logger;
}

/** Mark every announcement as read. */
export class MarkAllReadUseCase {
  private readonly notificationGateway: NotificationGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkAllReadUseCaseDeps) {
    this.notificationGateway = deps.notificationGateway;
    this.logger = deps.logger.child('mark-all-read');
  }

  public async execute(): Promise<Result<readonly Announcement[], NotificationError>> {
    const result = await this.notificationGateway.markAllRead();
    if (!result.ok) {
      this.logger.warn('Marking all read failed', { code: result.error.code });
    }
    return result;
  }
}
