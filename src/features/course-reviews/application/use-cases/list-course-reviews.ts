import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Review, ReviewError, ReviewGateway } from '../../domain';

export interface ListCourseReviewsUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Fetch the reviews for one course. */
export class ListCourseReviewsUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: ListCourseReviewsUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('list-course-reviews');
  }

  public async execute(
    courseId: string,
  ): Promise<Result<readonly Review[], ReviewError>> {
    const result = await this.reviewGateway.listByCourse(courseId);
    if (!result.ok) {
      this.logger.warn('Listing course reviews failed', {
        code: result.error.code,
        courseId,
      });
    }
    return result;
  }
}
