import type { ReactElement } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './FilterChips.module.css';

export interface FilterChipItem {
  readonly id: string;
  readonly label: string;
  readonly onDismiss: () => void;
}

export interface FilterChipsProps {
  readonly chips: readonly FilterChipItem[];
  readonly onClearAll: () => void;
}

/** Dismissible "active filters" row + a "Clear all" action. Renders nothing when empty. */
export const FilterChips = ({
  chips,
  onClearAll,
}: FilterChipsProps): ReactElement | null => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={styles.chipsRow}>
      <span className={styles.chipLabel}>Active filters:</span>

      {chips.map((chip) => (
        <span key={chip.id} className={styles.filterChip}>
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onDismiss}
            className={styles.chipDismiss}
            aria-label={`Clear ${chip.id} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <Button variant="link" size="xs" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
};
