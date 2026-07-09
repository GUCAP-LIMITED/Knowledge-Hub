import type { ReactElement } from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../domain';
import { StarRating } from './StarRating';
import styles from './CourseReviewsPanel.module.css';

export interface StarSummaryProps {
  readonly reviews: readonly Review[];
  readonly average: number;
}

/** Average rating + 5→1 star distribution bars. */
export const StarSummary = ({ reviews, average }: StarSummaryProps): ReactElement => {
  const total = reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  return (
    <div className={styles.summary}>
      <div className={styles.avgBox}>
        <div className={styles.avgValue}>{average.toFixed(1)}</div>
        <StarRating value={Math.round(average)} size="sm" />
        <div className={styles.avgCount}>
          {total} review{total === 1 ? '' : 's'}
        </div>
      </div>
      <div className={styles.dist}>
        {distribution.map((row) => (
          <div key={row.star} className={styles.distRow}>
            <span className={styles.distStar}>
              {row.star} <Star size={11} aria-hidden="true" />
            </span>
            <span className={styles.distTrack}>
              <span
                className={styles.distFill}
                style={{
                  width: `${String(total === 0 ? 0 : (row.count / total) * 100)}%`,
                }}
              />
            </span>
            <span className={styles.distCount}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
