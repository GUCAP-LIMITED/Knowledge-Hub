import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Review, ReviewError, ReviewGateway } from '../../domain';

export interface UnmarkReviewHelpfulUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Remove a "helpful" vote from a review. */
export class UnmarkReviewHelpfulUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: UnmarkReviewHelpfulUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('unmark-review-helpful');
  }

  public async execute(id: string): Promise<Result<Review, ReviewError>> {
    const result = await this.reviewGateway.unmarkHelpful(id);
    if (isErr(result)) {
      this.logger.warn('Unmarking review helpful failed', {
        code: result.error.code,
        id,
      });
    }
    return result;
  }
}
