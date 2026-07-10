import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './StarRating.module.css';

const STARS = [1, 2, 3, 4, 5] as const;

export interface StarRatingProps {
  readonly value: number;
  /** When provided, renders interactive radio-style buttons; otherwise a read-only display. */
  readonly onChange?: (value: number) => void;
  /** Id of a visible label to associate with the interactive group (instead of an aria-label). */
  readonly labelledBy?: string;
  readonly size?: 'sm' | 'md';
}

/** Five-star rating — read-only display (value announced), or interactive radio group. */
export const StarRating = ({
  value,
  onChange,
  labelledBy,
  size = 'md',
}: StarRatingProps): ReactElement => {
  const interactive = onChange !== undefined;
  const groupLabel = interactive ? 'Your rating' : `Rated ${String(value)} out of 5`;
  return (
    <div
      className={cn(styles.stars, styles[size])}
      role={interactive ? 'radiogroup' : undefined}
      aria-labelledby={interactive ? labelledBy : undefined}
      aria-label={labelledBy !== undefined ? undefined : groupLabel}
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
            role="radio"
            className={cn(styles.star, styles.button, filled && styles.filled)}
            aria-label={`${String(star)} star${star > 1 ? 's' : ''}`}
            aria-checked={star === value}
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
};
