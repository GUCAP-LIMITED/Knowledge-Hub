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
  useCourseReviewStatistics,
  useRecentReviews,
  useReviews,
  paginatedReviewsQueryKey,
  CourseReviewsPanel,
  ContentReviewsPanel,
  useSubmitReview,
  useMarkReviewHelpful,
  useDeleteReview,
  reviewsQueryKey,
  useInfiniteSelectableContentItems,
  selectableContentItemsQueryKey,
} from './presentation';
export {
  Review,
  type ReviewProps,
  averageRating,
  CourseReviewStatistics,
  TopRatedCourse,
  RecentReview,
  type RecentReviewProps,
  type RatingBreakdown,
  type CourseStatisticsQuery,
  type RecentReviewsQuery,
  type GetReviewsQuery,
  type SelectableContentItem,
  type SelectableContentParams,
} from './domain';
