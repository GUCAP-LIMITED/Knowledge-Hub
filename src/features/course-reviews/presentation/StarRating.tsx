import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './StarRating.module.css';

const STARS = [1, 2, 3, 4, 5] as const;

export interface StarRatingProps {
  readonly value: number;
  /** When provided, renders interactive buttons; otherwise a read-only display. */
  readonly onChange?: (value: number) => void;
  readonly size?: 'sm' | 'md';
}

/** Five-star rating — read-only display, or interactive when `onChange` is supplied. */
export const StarRating = ({
  value,
  onChange,
  size = 'md',
}: StarRatingProps): ReactElement => (
  <div
    className={cn(styles.stars, styles[size])}
    role={onChange !== undefined ? 'radiogroup' : undefined}
    aria-label="Star rating"
  >
    {STARS.map((star) => {
      const filled = star <= value;
      if (onChange === undefined) {
        return (
          <span
            key={star}
            className={cn(styles.star, filled && styles.filled)}
            aria-hidden="true"
          >
            ★
          </span>
        );
      }
      return (
        <button
          key={star}
          type="button"
          className={cn(styles.star, styles.button, filled && styles.filled)}
          aria-label={`${String(star)} star${star > 1 ? 's' : ''}`}
          aria-pressed={star === value}
          onClick={() => {
            onChange(star);
          }}
        >
          ★
        </button>
      );
    })}
  </div>
);
