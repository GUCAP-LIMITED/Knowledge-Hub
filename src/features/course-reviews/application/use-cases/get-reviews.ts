import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  PagedResult,
  Review,
  GetReviewsQuery,
  ReviewError,
  ReviewGateway,
} from '../../domain';

export interface GetReviewsUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Fetch paginated reviews optionally filtered by content type and/or content item. */
export class GetReviewsUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: GetReviewsUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('get-reviews');
  }

  public async execute(
    query?: GetReviewsQuery,
  ): Promise<Result<PagedResult<Review>, ReviewError>> {
    const result = await this.reviewGateway.getReviews(query);
    if (!result.ok) {
      this.logger.warn('Fetching reviews failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
