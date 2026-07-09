import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Review, ReviewError, ReviewGateway } from '../../domain';

export interface ListAllReviewsUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Fetch every review (moderation / browse). Pure orchestration. */
export class ListAllReviewsUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: ListAllReviewsUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('list-all-reviews');
  }

  public async execute(): Promise<Result<readonly Review[], ReviewError>> {
    const result = await this.reviewGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing reviews failed', { code: result.error.code });
    }
    return result;
  }
}
