import type { ReactElement } from 'react';
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

export interface CourseReviewsPanelProps {
  readonly courseId: string;
  readonly courseName: string;
}

/** Self-contained reviews block for one course: summary, write form and the list. */
export const CourseReviewsPanel = ({
  courseId,
  courseName,
}: CourseReviewsPanelProps): ReactElement => {
  const { user } = useAuth();
  const reviews = useCourseReviews(courseId);
  const submit = useSubmitReview();
  const helpful = useMarkReviewHelpful();
  const list = reviews.data ?? [];

  const handleSubmit = (values: { rating: number; feedback: string }): void => {
    submit.mutate({
      courseId,
      courseName,
      userId: user?.id ?? 'anonymous',
      userName: user?.fullName ?? 'Anonymous',
      userRole: user?.userType ?? 'Learner',
      rating: values.rating,
      feedback: values.feedback,
    });
  };

  return (
    <div className={styles.panel}>
      {list.length > 0 ? (
        <StarSummary reviews={list} average={averageRating(list)} />
      ) : null}
      <WriteReviewForm
        isSubmitting={submit.isPending}
        onSubmit={handleSubmit}
        lockedCourse={{ id: courseId, name: courseName }}
      />
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
