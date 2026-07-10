import type { ReactElement, ReactNode } from 'react';
import { cn } from '@shared/utils';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  /** Left cluster — typically the search field (grows to fill). */
  readonly search?: ReactNode;
  /** Right cluster — filter selects / sort. */
  readonly controls?: ReactNode;
  /** Trailing content pinned to the far right (e.g. result count or a CTA). */
  readonly trailing?: ReactNode;
  readonly className?: string;
}

/** A consistent toolbar for search + filters, aligned the same way on every screen. */
export const FilterBar = ({
  search,
  controls,
  trailing,
  className,
}: FilterBarProps): ReactElement => (
  <div className={cn(styles.bar, className)}>
    {search !== undefined ? <div className={styles.search}>{search}</div> : null}
    {controls !== undefined ? <div className={styles.controls}>{controls}</div> : null}
    {trailing !== undefined ? <div className={styles.trailing}>{trailing}</div> : null}
  </div>
);
