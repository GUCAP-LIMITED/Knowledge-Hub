import type { ReactElement } from 'react';
import { Alert } from '@shared/ui';
import { useAuth } from '@features/auth';
import { REVIEWABLE_COURSES } from '../infrastructure';
import { WriteReviewForm } from './WriteReviewForm';
import { ReviewsList } from './ReviewsList';
import {
  useAllReviews,
  useMarkReviewHelpful,
  useSubmitReview,
} from './use-course-reviews';
import styles from './ReviewsPage.module.css';

interface ReviewFormValues {
  courseId: string;
  rating: number;
  feedback: string;
}

/** Learner-facing reviews: write/edit your own and browse everyone else's. */
export const ReviewsPage = (): ReactElement => {
  const { user } = useAuth();
  const reviews = useAllReviews();
  const submit = useSubmitReview();
  const helpful = useMarkReviewHelpful();

  const handleSubmit = (values: ReviewFormValues): void => {
    const course = REVIEWABLE_COURSES.find((item) => item.id === values.courseId);
    submit.mutate({
      courseId: values.courseId,
      courseName: course?.name ?? values.courseId,
      userId: user?.id ?? 'anonymous',
      userName: user?.fullName ?? 'Anonymous',
      userRole: user?.userType ?? 'Learner',
      rating: values.rating,
      feedback: values.feedback,
    });
  };

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Course Reviews</h1>
        <p className={styles.subtitle}>
          Share your feedback and see what your colleagues think.
        </p>
      </header>

      <WriteReviewForm isSubmitting={submit.isPending} onSubmit={handleSubmit} />

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
    </section>
  );
};
