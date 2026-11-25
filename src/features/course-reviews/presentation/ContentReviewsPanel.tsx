import { useMemo, type ReactElement } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Alert, useDeleteConfirm } from '@shared/ui';
import { useAuth } from '@features/auth';
import { useMyCapabilities } from '@features/users';
import { averageRating, type Review } from '../domain';
import { StarSummary } from './StarSummary';
import { StarRating } from './StarRating';
import { WriteReviewForm } from './WriteReviewForm';
import { ReviewsList } from './ReviewsList';
import {
  useCourseReviews,
  useMarkReviewHelpful,
  useSubmitReview,
  useDeleteReview,
} from './use-course-reviews';
import styles from './CourseReviewsPanel.module.css';

export interface ContentReviewsPanelProps {
  /** Id of the reviewed content (course, tutorial or resource). */
  readonly contentId: string;
  readonly contentName: string;
  /** Optional heading — shown with a divider when the panel is embedded in a viewer. */
  readonly heading?: string;
  /**
   * Whether the viewer may write a review yet — gated on finishing the content and passing any
   * quiz. Reviews stay readable regardless; only the write form is gated. Defaults to true.
   */
  readonly canReview?: boolean;
}

const toReviewDeleteTarget = (r: Review): { id: string; title: string } => ({
  id: r.id,
  title:
    r.feedback.length > 0 ? `"${r.feedback.slice(0, 40)}..."` : `${r.userName}'s review`,
});

const ExistingUserReviewCard = ({
  review,
}: {
  readonly review: Review;
}): ReactElement => (
  <div
    style={{
      padding: '1.25rem',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--color-success)',
        }}
      >
        <CheckCircle2 size={16} /> You reviewed this content
      </span>
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {new Date(review.createdAt).toLocaleDateString()}
      </span>
    </div>
    <StarRating value={review.rating} size="sm" />
    {review.feedback.length > 0 ? (
      <p
        style={{
          margin: 0,
          fontSize: '0.9rem',
          color: 'var(--color-text)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {review.feedback}
      </p>
    ) : null}
  </div>
);

interface ReviewActionAreaProps {
  readonly existingUserReview: Review | undefined;
  readonly canReview: boolean;
  readonly isSubmitting: boolean;
  readonly contentId: string;
  readonly contentName: string;
  readonly onSubmit: (values: { rating: number; feedback: string }) => void;
}

const ReviewActionArea = ({
  existingUserReview,
  canReview,
  isSubmitting,
  contentId,
  contentName,
  onSubmit,
}: ReviewActionAreaProps): ReactElement => {
  if (existingUserReview !== undefined) {
    return <ExistingUserReviewCard review={existingUserReview} />;
  }

  if (canReview) {
    return (
      <WriteReviewForm
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        lockedCourse={{ id: contentId, name: contentName }}
      />
    );
  }

  return (
    <p className={styles.reviewLocked}>
      <Lock size={15} aria-hidden="true" />
      Complete this content and pass any quiz to leave a review.
    </p>
  );
};

/**
 * Self-contained ratings + reviews block for any content item. Reviews are immutable and once per user.
 * Displays existing review in read-only mode if the active user has already reviewed.
 * Gated by `Reviews.View` (hides if unpermitted) and `Reviews.Delete` (for deletion actions).
 */
export const ContentReviewsPanel = ({
  contentId,
  contentName,
  heading,
  canReview = true,
}: ContentReviewsPanelProps): ReactElement | null => {
  const { user } = useAuth();
  const { can } = useMyCapabilities();
  const canView = can('reviews', 'view');
  const canDelete = can('reviews', 'delete');

  const reviews = useCourseReviews(contentId, { enabled: canView });
  const submit = useSubmitReview();
  const helpful = useMarkReviewHelpful();
  const del = useDeleteReview();
  const list = useMemo(() => reviews.data ?? [], [reviews.data]);

  const deleteTargets = useMemo(
    () => (canDelete ? list.map(toReviewDeleteTarget) : []),
    [canDelete, list],
  );

  const deleteConfirm = useDeleteConfirm(
    deleteTargets,
    'review',
    (id) => {
      if (canDelete) del.mutate(id);
    },
    del.isPending,
  );

  const existingUserReview = list.find((r) => r.userId === user?.id);

  if (!canView) {
    return null;
  }

  const handleSubmit = (values: { rating: number; feedback: string }): void => {
    submit.mutate({
      contentId,
      contentName,
      userId: user?.id ?? 'anonymous',
      userName: user?.fullName ?? 'Anonymous',
      userRole: user?.userType ?? 'Learner',
      rating: values.rating,
      feedback: values.feedback,
    });
  };

  return (
    <div className={styles.panel}>
      {heading !== undefined ? <h3 className={styles.heading}>{heading}</h3> : null}
      {list.length > 0 ? (
        <StarSummary reviews={list} average={averageRating(list)} />
      ) : null}

      <ReviewActionArea
        existingUserReview={existingUserReview}
        canReview={canReview}
        isSubmitting={submit.isPending}
        contentId={contentId}
        contentName={contentName}
        onSubmit={handleSubmit}
      />

      {submit.isError ? (
        <Alert tone="error" title="Could not submit your review">
          {submit.error.message}
        </Alert>
      ) : null}

      <ReviewsList
        query={reviews}
        currentUserId={user?.id}
        canVoteHelpful={canReview && user !== null}
        onHelpful={(id, isHelpful) => {
          helpful.mutate({ id, isHelpful });
        }}
        helpfulBusy={helpful.isPending}
        onDelete={canDelete ? deleteConfirm.request : undefined}
        deleteBusy={del.isPending}
        canDelete={canDelete}
      />

      {canDelete ? deleteConfirm.dialog : null}
    </div>
  );
};
