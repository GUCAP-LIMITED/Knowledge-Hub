import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Review, ReviewError, ReviewGateway } from '../../domain';

export interface MarkReviewHelpfulUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Register a "helpful" vote on a review. */
export class MarkReviewHelpfulUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkReviewHelpfulUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('mark-review-helpful');
  }

  public async execute(id: string): Promise<Result<Review, ReviewError>> {
    const result = await this.reviewGateway.markHelpful(id);
    if (isErr(result)) {
      this.logger.warn('Marking review helpful failed', { code: result.error.code, id });
    }
    return result;
  }
}
