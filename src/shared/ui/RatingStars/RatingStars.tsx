import type { ReactElement } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@shared/utils';
import styles from './RatingStars.module.css';

const STARS = [1, 2, 3, 4, 5] as const;

export interface RatingStarsProps {
  readonly rating: number;
  readonly reviewCount?: number | undefined;
  readonly size?: 'sm' | 'md' | undefined;
  readonly showValue?: boolean | undefined;
  readonly className?: string | undefined;
}

/**
 * Accessible 5-star rating display showing filled and empty stars,
 * numerical average rating (e.g. 4.5 or 0.0), and optional review count.
 */
export const RatingStars = ({
  rating,
  reviewCount,
  size = 'sm',
  showValue = true,
  className,
}: RatingStarsProps): ReactElement => {
  const safeRating = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));
  const roundedRating = Math.round(safeRating);
  const iconSize = size === 'sm' ? 13 : 16;
  const label = `Rated ${safeRating.toFixed(1)} out of 5 stars${
    reviewCount !== undefined && reviewCount > 0
      ? ` (${String(reviewCount)} reviews)`
      : ''
  }`;

  return (
    <div
      className={cn(styles.container, styles[size], className)}
      aria-label={label}
      title={label}
    >
      <div className={styles.starsTrack} aria-hidden="true">
        {STARS.map((starIndex) => {
          const isFilled = starIndex <= roundedRating;
          return (
            <Star
              key={starIndex}
              size={iconSize}
              data-star-state={isFilled ? 'filled' : 'empty'}
              className={cn(styles.star, isFilled ? styles.filled : styles.empty)}
              fill={isFilled ? 'currentColor' : 'rgba(245, 158, 11, 0.2)'}
              strokeWidth={1.8}
            />
          );
        })}
      </div>
      {showValue ? (
        <span className={styles.valueText}>{safeRating.toFixed(1)}</span>
      ) : null}
      {reviewCount !== undefined && reviewCount > 0 ? (
        <span className={styles.reviewCount}>({reviewCount})</span>
      ) : null}
    </div>
  );
};
