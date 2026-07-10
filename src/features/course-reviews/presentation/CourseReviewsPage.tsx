import { useMemo, type ReactElement } from 'react';
import { BookOpen, Check, MessageSquare, Star } from 'lucide-react';
import { Alert, PageHeader, Spinner, StatCard } from '@shared/ui';
import { RecentReviewsCard, TopRatedCard } from './CourseReviewsParts';
import {
  computeStats,
  courseReviewsOnly,
  topRatedCourses,
} from './course-reviews-analytics';
import { useAllReviews, useDeleteReview } from './use-course-reviews';
import styles from './CourseReviewsPage.module.css';

/** Admin course-reviews dashboard: top-line metrics, top-rated courses, and recent feedback. */
export const CourseReviewsPage = (): ReactElement => {
  const reviews = useAllReviews();
  const del = useDeleteReview();
  const data = useMemo(() => courseReviewsOnly(reviews.data ?? []), [reviews.data]);
  const stats = useMemo(() => computeStats(data), [data]);
  const topRated = useMemo(() => topRatedCourses(data), [data]);

  if (reviews.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading reviews" />
      </div>
    );
  }
  if (reviews.isError) {
    return (
      <Alert tone="error" title="Could not load reviews">
        {reviews.error.message}
      </Alert>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Course Reviews"
        subtitle="Monitor learner feedback across all courses"
      />

      <div className={styles.stats}>
        <StatCard
          label="Total Reviews"
          value={stats.total}
          icon={MessageSquare}
          tone="primary"
        />
        <StatCard label="Avg Rating" value={stats.avg} icon={Star} tone="warning" />
        <StatCard
          label="Courses Rated"
          value={stats.coursesRated}
          icon={BookOpen}
          tone="success"
        />
        <StatCard label="Helpful Votes" value={stats.helpful} icon={Check} tone="info" />
      </div>

      <div className={styles.columns}>
        <TopRatedCard courses={topRated} />
        <RecentReviewsCard
          reviews={data}
          deleting={del.isPending}
          onDelete={(id) => {
            del.mutate(id);
          }}
        />
      </div>
    </section>
  );
};
