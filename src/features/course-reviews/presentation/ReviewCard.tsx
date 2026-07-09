import type { ReactElement, ReactNode } from 'react';
import { Button } from '@shared/ui';
import type { Review } from '../domain';
import { StarRating } from './StarRating';
import styles from './ReviewCard.module.css';

export interface ReviewCardProps {
  readonly review: Review;
  readonly onHelpful?: ((id: string) => void) | undefined;
  readonly helpfulBusy?: boolean | undefined;
  /** Optional action controls (e.g. a moderation delete button). */
  readonly children?: ReactNode;
}

/** A single review: who, their rating, the comment, date and a helpful vote. */
export const ReviewCard = ({
  review,
  onHelpful,
  helpfulBusy,
  children,
}: ReviewCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.head}>
      <div className={styles.who}>
        <span className={styles.course}>{review.courseName}</span>
        <span className={styles.author}>
          {review.userName} · {review.userRole}
        </span>
      </div>
      <StarRating value={review.rating} size="sm" />
    </div>
    <p className={styles.feedback}>{review.feedback}</p>
    <div className={styles.foot}>
      <span className={styles.date}>{review.createdAt.toLocaleDateString()}</span>
      <div className={styles.actions}>
        {onHelpful !== undefined ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={helpfulBusy}
            onClick={() => {
              onHelpful(review.id);
            }}
          >
            Helpful ({review.helpful})
          </Button>
        ) : (
          <span className={styles.count}>{review.helpful} found this helpful</span>
        )}
        {children}
      </div>
    </div>
  </article>
);
