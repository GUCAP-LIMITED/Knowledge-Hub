import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import { ReviewsList } from './ReviewsList';
import { useAllReviews, useDeleteReview } from './use-course-reviews';
import styles from './ReviewsPage.module.css';

/** Admin review moderation: browse all reviews and remove anything inappropriate. */
export const CourseReviewsPage = (): ReactElement => {
  const reviews = useAllReviews();
  const del = useDeleteReview();

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Review Moderation</h1>
        <p className={styles.subtitle}>
          All course reviews. Remove anything inappropriate.
        </p>
      </header>

      <ReviewsList
        query={reviews}
        renderActions={(review) => (
          <Button
            size="sm"
            variant="danger"
            disabled={del.isPending}
            onClick={() => {
              del.mutate(review.id);
            }}
          >
            Delete
          </Button>
        )}
      />
    </section>
  );
};
