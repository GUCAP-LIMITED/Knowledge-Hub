import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import {
  DeleteReviewUseCase,
  ListAllReviewsUseCase,
  ListCourseReviewsUseCase,
  MarkReviewHelpfulUseCase,
  SubmitReviewUseCase,
} from './application';
import { InMemoryReviewGateway } from './infrastructure';

export interface CourseReviewsModuleDeps {
  readonly logger: Logger;
  readonly clock: Clock;
}

/** The use cases exposed by the course-reviews feature, consumed via a context provider. */
export interface CourseReviewsModule {
  readonly listAllReviews: ListAllReviewsUseCase;
  readonly listCourseReviews: ListCourseReviewsUseCase;
  readonly submitReview: SubmitReviewUseCase;
  readonly markReviewHelpful: MarkReviewHelpfulUseCase;
  readonly deleteReview: DeleteReviewUseCase;
}

/** Composition root for the course-reviews feature: wires the in-memory gateway to the use cases. */
export const createCourseReviewsModule = (
  deps: CourseReviewsModuleDeps,
): CourseReviewsModule => {
  const reviewGateway = new InMemoryReviewGateway({ logger: deps.logger });
  const shared = { reviewGateway, logger: deps.logger };

  return {
    listAllReviews: new ListAllReviewsUseCase(shared),
    listCourseReviews: new ListCourseReviewsUseCase(shared),
    submitReview: new SubmitReviewUseCase({ ...shared, clock: deps.clock }),
    markReviewHelpful: new MarkReviewHelpfulUseCase(shared),
    deleteReview: new DeleteReviewUseCase(shared),
  };
};
