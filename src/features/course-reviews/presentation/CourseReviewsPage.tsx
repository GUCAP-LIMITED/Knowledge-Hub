import { useMemo, useState, type ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, MessageSquare, Star } from 'lucide-react';
import {
  Alert,
  Button,
  PageHeader,
  RowListSkeleton,
  StatCard,
  StatCardsSkeleton,
  useDeleteConfirm,
} from '@shared/ui';
import { useDebouncedValue } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { CourseReviewStatistics, RecentReview } from '../domain';
import { RecentReviewsCard, TopRatedCard } from './CourseReviewsParts';
import {
  useCourseReviewStatistics,
  useDeleteReview,
  useRecentReviews,
} from './use-course-reviews';
import styles from './CourseReviewsPage.module.css';

interface CourseReviewsHeaderProps {
  readonly isFromDashboard: boolean;
  readonly onBack: () => void;
}

const CourseReviewsHeader = ({
  isFromDashboard,
  onBack,
}: CourseReviewsHeaderProps): ReactElement => (
  <PageHeader
    title="Course Reviews"
    subtitle="Monitor learner feedback across all catalog content"
  >
    {isFromDashboard ? (
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
      </Button>
    ) : null}
  </PageHeader>
);

const CourseReviewsSkeleton = ({
  isFromDashboard,
  onBack,
}: CourseReviewsHeaderProps): ReactElement => (
  <section className={styles.screen}>
    <CourseReviewsHeader isFromDashboard={isFromDashboard} onBack={onBack} />
    <StatCardsSkeleton />
    <div className={styles.columns}>
      <div className={styles.card}>
        <h3 className={styles.cardHeading}>Top rated courses</h3>
        <RowListSkeleton count={5} leading />
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardHeading}>Recent reviews</h3>
        <RowListSkeleton count={4} />
      </div>
    </div>
  </section>
);

const AccessDeniedView = ({
  isFromDashboard,
  onBack,
}: CourseReviewsHeaderProps): ReactElement => (
  <section className={styles.screen}>
    <CourseReviewsHeader isFromDashboard={isFromDashboard} onBack={onBack} />
    <Alert tone="error" title="Access Denied">
      You do not have permission to view course reviews.
    </Alert>
  </section>
);

const CourseReviewsStats = ({
  stats,
}: {
  readonly stats: CourseReviewStatistics;
}): ReactElement => (
  <div className={styles.stats}>
    <StatCard
      label="Total Reviews"
      value={stats.totalReviews}
      icon={MessageSquare}
      tone="primary"
    />
    <StatCard
      label="Avg Rating"
      value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
      icon={Star}
      tone="warning"
    />
    <StatCard
      label="Courses Rated"
      value={stats.totalRatedCourses}
      icon={BookOpen}
      tone="success"
    />
    <StatCard
      label="Helpful Votes"
      value={stats.totalHelpfulVotes}
      icon={Check}
      tone="info"
    />
  </div>
);

const toRecentReviewDeleteTarget = (r: RecentReview): { id: string; title: string } => ({
  id: r.id,
  title:
    r.feedback.length > 0
      ? `"${r.feedback.slice(0, 40)}..."`
      : `${r.reviewerName}'s review`,
});

const buildRecentReviewsFilter = (
  debouncedQuery: string,
  rating: string,
): { filter?: string; stars?: number; maxResultCount: number } => {
  const trimmed = debouncedQuery.trim();
  const result: { filter?: string; stars?: number; maxResultCount: number } = {
    maxResultCount: 50,
  };
  if (trimmed.length > 0) {
    result.filter = trimmed;
  }
  if (rating !== 'all') {
    result.stars = Number(rating);
  }
  return result;
};

const CourseReviewsStatusAlert = ({
  isError,
  errorMessage,
}: {
  readonly isError: boolean;
  readonly errorMessage?: string | undefined;
}): ReactElement => {
  if (isError) {
    return (
      <Alert tone="error" title="Could not load review statistics">
        {errorMessage ?? 'Review statistics failed to load.'}
      </Alert>
    );
  }
  return (
    <Alert tone="error" title="Could not load reviews">
      Review data is currently unavailable.
    </Alert>
  );
};

interface CourseReviewsContentProps {
  readonly stats: CourseReviewStatistics;
  readonly recentItems: readonly RecentReview[];
  readonly recentTotalCount: number;
  readonly query: string;
  readonly rating: string;
  readonly onQueryChange: (query: string) => void;
  readonly onRatingChange: (rating: string) => void;
  readonly canDelete: boolean;
  readonly isDeleting: boolean;
  readonly onDelete: (id: string) => void;
  readonly isLoading?: boolean | undefined;
  readonly isError?: boolean | undefined;
  readonly errorMessage?: string | undefined;
}

const CourseReviewsContent = ({
  stats,
  recentItems,
  recentTotalCount,
  query,
  rating,
  onQueryChange,
  onRatingChange,
  canDelete,
  isDeleting,
  onDelete,
  isLoading,
  isError,
  errorMessage,
}: CourseReviewsContentProps): ReactElement => (
  <div className={styles.columns}>
    <TopRatedCard courses={stats.topRatedCourses} />
    <RecentReviewsCard
      reviews={recentItems}
      totalCount={recentTotalCount}
      query={query}
      rating={rating}
      onQueryChange={onQueryChange}
      onRatingChange={onRatingChange}
      deleting={canDelete && isDeleting}
      onDelete={onDelete}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    />
  </div>
);

const useDashboardBackCheck = (): {
  isFromDashboard: boolean;
  handleBack: () => void;
} => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { fromDashboardAction?: boolean } | null;
  const isFromDashboard = state?.fromDashboardAction === true;

  const handleBack = (): void => {
    navigate('/dashboard');
  };

  return { isFromDashboard, handleBack };
};

const useReviewDeletion = (
  canDelete: boolean,
  recentItems: readonly RecentReview[],
): {
  isDeleting: boolean;
  dialog: ReactElement | null;
  onDelete: (id: string) => void;
} => {
  const del = useDeleteReview();

  const deleteTargets = useMemo(
    () => (canDelete ? recentItems.map(toRecentReviewDeleteTarget) : []),
    [canDelete, recentItems],
  );

  const deleteConfirm = useDeleteConfirm(
    deleteTargets,
    'review',
    (id) => {
      if (canDelete) del.mutate(id);
    },
    del.isPending,
  );

  return {
    isDeleting: del.isPending,
    dialog: canDelete ? deleteConfirm.dialog : null,
    onDelete: (id: string): void => {
      if (canDelete) {
        deleteConfirm.request(id);
      }
    },
  };
};

/** Admin course-reviews dashboard: top-line metrics, top-rated courses, and recent feedback. */
export const CourseReviewsPage = (): ReactElement => {
  const { isFromDashboard, handleBack } = useDashboardBackCheck();
  const [query, setQuery] = useState('');
  const [rating, setRating] = useState('all');
  const debouncedQuery = useDebouncedValue(query, 300);

  const { can, isLoading: capabilitiesLoading } = useMyCapabilities();
  const canView = can('course-reviews', 'view');
  const canDelete = can('reviews', 'delete');

  const statistics = useCourseReviewStatistics();
  const recentQuery = useMemo(
    () => buildRecentReviewsFilter(debouncedQuery, rating),
    [debouncedQuery, rating],
  );
  const recentReviews = useRecentReviews(recentQuery);

  const recentItems = useMemo(
    () => recentReviews.data?.items ?? [],
    [recentReviews.data?.items],
  );
  const recentTotalCount = recentReviews.data?.totalCount ?? 0;

  const { isDeleting, dialog, onDelete } = useReviewDeletion(canDelete, recentItems);

  if (capabilitiesLoading || statistics.isLoading) {
    return (
      <CourseReviewsSkeleton isFromDashboard={isFromDashboard} onBack={handleBack} />
    );
  }

  if (!canView) {
    return <AccessDeniedView isFromDashboard={isFromDashboard} onBack={handleBack} />;
  }

  const stats = statistics.data;

  if (statistics.isError || stats === undefined) {
    return (
      <CourseReviewsStatusAlert
        isError={statistics.isError}
        errorMessage={statistics.error?.message}
      />
    );
  }

  return (
    <section className={styles.screen}>
      <CourseReviewsHeader isFromDashboard={isFromDashboard} onBack={handleBack} />

      <CourseReviewsStats stats={stats} />

      <CourseReviewsContent
        stats={stats}
        recentItems={recentItems}
        recentTotalCount={recentTotalCount}
        query={query}
        rating={rating}
        onQueryChange={setQuery}
        onRatingChange={setRating}
        canDelete={canDelete}
        isDeleting={isDeleting}
        onDelete={onDelete}
        isLoading={recentReviews.isLoading}
        isError={recentReviews.isError}
        errorMessage={recentReviews.error?.message}
      />

      {dialog}
    </section>
  );
};
