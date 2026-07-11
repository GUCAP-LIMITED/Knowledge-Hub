import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './Spot.module.css';

export interface SpotProps {
  readonly icon: LucideIcon;
  /** Accent shape colour — teal (default) or orange. */
  readonly tone?: 'primary' | 'secondary';
  readonly size?: 'md' | 'lg';
}

/**
 * A branded illustration motif for empty states and error pages: an offset accent card behind a
 * soft duotone tile holding the icon, with a small accent dot. One consistent style app-wide.
 */
export const Spot = ({
  icon: Icon,
  tone = 'primary',
  size = 'md',
}: SpotProps): ReactElement => (
  <div className={cn(styles.spot, styles[size], styles[tone])} aria-hidden="true">
    <span className={styles.back} />
    <span className={styles.front}>
      <Icon size={size === 'lg' ? 34 : 28} strokeWidth={1.6} />
    </span>
    <span className={styles.dot} />
  </div>
);
