import type { ReactElement } from 'react';
import { X } from 'lucide-react';
import styles from './ContentTypesManager.module.css';

export interface TypeChipProps {
  readonly label: string;
  /** Omit to render the chip read-only (no remove control). */
  readonly onRemove?: (() => void) | undefined;
}

/** A refined taxonomy chip; the remove control stays subtle and appears on hover/focus. */
export const TypeChip = ({ label, onRemove }: TypeChipProps): ReactElement => (
  <span className={styles.chip}>
    <span className={styles.chipLabel}>{label}</span>
    {onRemove !== undefined ? (
      <button
        type="button"
        className={styles.chipRemove}
        aria-label={`Remove ${label}`}
        onClick={onRemove}
      >
        <X size={13} aria-hidden="true" />
      </button>
    ) : null}
  </span>
);
