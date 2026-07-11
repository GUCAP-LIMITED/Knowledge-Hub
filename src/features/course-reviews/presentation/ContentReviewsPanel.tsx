import type { ReactElement } from 'react';
import { Lock } from 'lucide-react';
import { Alert } from '@shared/ui';
import { useAuth } from '@features/auth';
import { averageRating } from '../domain';
import { StarSummary } from './StarSummary';
import { WriteReviewForm } from './WriteReviewForm';
import { ReviewsList } from './ReviewsList';
import {
  useCourseReviews,
  useMarkReviewHelpful,
  useSubmitReview,
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

/**
 * Self-contained ratings + reviews block for any content item. Reviews are keyed by the content id,
 * so one review per user per item — re-submitting overwrites. Reused by courses, tutorials and
 * resources.
 */
export const ContentReviewsPanel = ({
  contentId,
  contentName,
  heading,
  canReview = true,
}: ContentReviewsPanelProps): ReactElement => {
  const { user } = useAuth();
  const reviews = useCourseReviews(contentId);
  const submit = useSubmitReview();
  const helpful = useMarkReviewHelpful();
  const list = reviews.data ?? [];

  const handleSubmit = (values: { rating: number; feedback: string }): void => {
    submit.mutate({
      courseId: contentId,
      courseName: contentName,
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
      {canReview ? (
        <WriteReviewForm
          isSubmitting={submit.isPending}
          onSubmit={handleSubmit}
          lockedCourse={{ id: contentId, name: contentName }}
        />
      ) : (
        <p className={styles.reviewLocked}>
          <Lock size={15} aria-hidden="true" />
          Complete this and pass any quiz to leave a review.
        </p>
      )}
      {submit.isError ? (
        <Alert tone="error" title="Could not submit your review">
          {submit.error.message}
        </Alert>
      ) : null}
      <ReviewsList
        query={reviews}
        onHelpful={(id) => {
          helpful.mutate(id);
        }}
        helpfulBusy={helpful.isPending}
      />
    </div>
  );
};
