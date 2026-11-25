import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  NotificationError,
  NotificationGateway,
  NotificationStats,
} from '../../domain';

export interface GetNotificationStatsUseCaseDeps {
  readonly notificationGateway: NotificationGateway;
  readonly logger: Logger;
}

/** Fetch aggregated notification statistics (total, read, unread) for current user. */
export class GetNotificationStatsUseCase {
  private readonly notificationGateway: NotificationGateway;
  private readonly logger: Logger;

  public constructor(deps: GetNotificationStatsUseCaseDeps) {
    this.notificationGateway = deps.notificationGateway;
    this.logger = deps.logger.child('get-notification-stats');
  }

  public async execute(): Promise<Result<NotificationStats, NotificationError>> {
    const result = await this.notificationGateway.getStats();
    if (!result.ok) {
      this.logger.warn('Fetching notification stats failed', { code: result.error.code });
    }
    return result;
  }
}
