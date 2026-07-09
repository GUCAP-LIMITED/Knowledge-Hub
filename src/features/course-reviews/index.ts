/**
 * Public API of the `course-reviews` feature — the learner review flow (ReviewsPage) and admin
 * moderation (CourseReviewsPage) over one `Review` aggregate.
 */
export {
  createCourseReviewsModule,
  type CourseReviewsModule,
  type CourseReviewsModuleDeps,
} from './course-reviews-module';
export {
  CourseReviewsModuleProvider,
  useAllReviews,
  useCourseReviews,
  CourseReviewsPanel,
  useSubmitReview,
  useMarkReviewHelpful,
  useDeleteReview,
  reviewsQueryKey,
} from './presentation';
export { Review, type ReviewProps, averageRating } from './domain';
