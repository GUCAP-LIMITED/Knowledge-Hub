import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './TutorialsPage.module.css';

export interface CategoryPillsProps {
  readonly categories: readonly string[];
  readonly active: string;
  readonly allLabel: string;
  readonly onSelect: (value: string) => void;
}

/** Horizontal pill filter — "all" plus one pill per category. */
export const CategoryPills = ({
  categories,
  active,
  allLabel,
  onSelect,
}: CategoryPillsProps): ReactElement => (
  <div className={styles.pills} role="tablist" aria-label="Filter tutorials by category">
    {['all', ...categories].map((cat) => (
      <button
        key={cat}
        type="button"
        role="tab"
        aria-selected={active === cat}
        className={cn(styles.pill, active === cat && styles.pillActive)}
        onClick={() => {
          onSelect(cat);
        }}
      >
        {cat === 'all' ? allLabel : cat}
      </button>
    ))}
  </div>
);
