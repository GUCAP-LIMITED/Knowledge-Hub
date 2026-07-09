export * from './CourseReviewsModuleProvider';
export * from './use-course-reviews';
export * from './CourseReviewsPanel';
export * from './use-course-reviews-module';
// `ReviewsPage` and `CourseReviewsPage` are omitted: the router lazy-imports them from their module
// paths so they code-split, rather than being pulled into the eagerly-imported barrel chain.
