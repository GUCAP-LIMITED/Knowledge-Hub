import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PagedResult,
  RecentReview,
  RecentReviewsQuery,
  ReviewError,
  ReviewGateway,
} from '../../domain';

export interface GetRecentReviewsUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Fetch paginated recent course reviews with advanced filtering. */
export class GetRecentReviewsUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: GetRecentReviewsUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('get-recent-reviews');
  }

  public async execute(
    query?: RecentReviewsQuery,
  ): Promise<Result<PagedResult<RecentReview>, ReviewError>> {
    const result = await this.reviewGateway.getRecentReviews(query);
    if (!result.ok) {
      this.logger.warn('Fetching recent reviews failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
