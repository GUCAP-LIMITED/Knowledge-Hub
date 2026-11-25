import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import type { HttpClient } from '@core/http';
import {
  DeleteReviewUseCase,
  GetCourseStatisticsUseCase,
  GetRecentReviewsUseCase,
  GetReviewsUseCase,
  GetSelectableContentItemsUseCase,
  ListAllReviewsUseCase,
  ListCourseReviewsUseCase,
  MarkReviewHelpfulUseCase,
  UnmarkReviewHelpfulUseCase,
  SubmitReviewUseCase,
} from './application';
import { HttpReviewGateway } from './infrastructure';

export interface CourseReviewsModuleDeps {
  readonly logger: Logger;
  readonly clock: Clock;
  readonly httpClient: HttpClient;
}

/** The use cases exposed by the course-reviews feature, consumed via a context provider. */
export interface CourseReviewsModule {
  readonly listAllReviews: ListAllReviewsUseCase;
  readonly listCourseReviews: ListCourseReviewsUseCase;
  readonly submitReview: SubmitReviewUseCase;
  readonly markReviewHelpful: MarkReviewHelpfulUseCase;
  readonly unmarkReviewHelpful: UnmarkReviewHelpfulUseCase;
  readonly deleteReview: DeleteReviewUseCase;
  readonly getCourseStatistics: GetCourseStatisticsUseCase;
  readonly getRecentReviews: GetRecentReviewsUseCase;
  readonly getReviews: GetReviewsUseCase;
  readonly getSelectableContentItems: GetSelectableContentItemsUseCase;
}

/** Composition root for the course-reviews feature: wires the in-memory gateway to the use cases. */
export const createCourseReviewsModule = (
  deps: CourseReviewsModuleDeps,
): CourseReviewsModule => {
  const reviewGateway = new HttpReviewGateway({
    logger: deps.logger,
    http: deps.httpClient,
  });
  const shared = { reviewGateway, logger: deps.logger };

  return {
    listAllReviews: new ListAllReviewsUseCase(shared),
    listCourseReviews: new ListCourseReviewsUseCase(shared),
    submitReview: new SubmitReviewUseCase({ ...shared, clock: deps.clock }),
    markReviewHelpful: new MarkReviewHelpfulUseCase(shared),
    unmarkReviewHelpful: new UnmarkReviewHelpfulUseCase(shared),
    deleteReview: new DeleteReviewUseCase(shared),
    getCourseStatistics: new GetCourseStatisticsUseCase(shared),
    getRecentReviews: new GetRecentReviewsUseCase(shared),
    getReviews: new GetReviewsUseCase(shared),
    getSelectableContentItems: new GetSelectableContentItemsUseCase(shared),
  };
};
