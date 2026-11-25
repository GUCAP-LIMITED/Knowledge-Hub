import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  Announcement,
  NotificationError,
  NotificationGateway,
  NotificationQueryParams,
  PagedAnnouncementsResult,
} from '../../domain';

export interface ListAnnouncementsUseCaseDeps {
  readonly notificationGateway: NotificationGateway;
  readonly logger: Logger;
}

/** Fetch announcements, both unpaginated (legacy/convenience) and database-level paged. */
export class ListAnnouncementsUseCase {
  private readonly notificationGateway: NotificationGateway;
  private readonly logger: Logger;

  public constructor(deps: ListAnnouncementsUseCaseDeps) {
    this.notificationGateway = deps.notificationGateway;
    this.logger = deps.logger.child('list-announcements');
  }

  public async execute(): Promise<Result<readonly Announcement[], NotificationError>> {
    const result = await this.notificationGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing announcements failed', { code: result.error.code });
    }
    return result;
  }

  public async executePaged(
    params: NotificationQueryParams,
  ): Promise<Result<PagedAnnouncementsResult, NotificationError>> {
    const result = await this.notificationGateway.listPaged(params);
    if (!result.ok) {
      this.logger.warn('Listing paged announcements failed', { code: result.error.code });
    }
    return result;
  }
}
