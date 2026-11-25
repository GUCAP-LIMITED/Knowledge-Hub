import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  CourseReviewStatistics,
  CourseStatisticsQuery,
  ReviewError,
  ReviewGateway,
} from '../../domain';

export interface GetCourseStatisticsUseCaseDeps {
  readonly reviewGateway: ReviewGateway;
  readonly logger: Logger;
}

/** Fetch aggregated course review statistics, rating breakdown, and top-rated courses. */
export class GetCourseStatisticsUseCase {
  private readonly reviewGateway: ReviewGateway;
  private readonly logger: Logger;

  public constructor(deps: GetCourseStatisticsUseCaseDeps) {
    this.reviewGateway = deps.reviewGateway;
    this.logger = deps.logger.child('get-course-statistics');
  }

  public async execute(
    query?: CourseStatisticsQuery,
  ): Promise<Result<CourseReviewStatistics, ReviewError>> {
    const result = await this.reviewGateway.getCourseStatistics(query);
    if (!result.ok) {
      this.logger.warn('Fetching course review statistics failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
