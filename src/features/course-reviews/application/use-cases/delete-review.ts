import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { ReviewError, ReviewGateway } from '../../domain';

export interface DeleteReviewUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Remove a review (moderation). */
export class DeleteReviewUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteReviewUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('delete-review');
  }

  public async execute(id: string): Promise<Result<void, ReviewError>> {
    const result = await this.reviewGateway.remove(id);
    if (isErr(result)) {
      this.logger.warn('Deleting review failed', { code: result.error.code, id });
    }
    return result;
  }
}
