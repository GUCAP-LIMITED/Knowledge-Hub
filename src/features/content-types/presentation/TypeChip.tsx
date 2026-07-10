import type { ReactElement } from 'react';
import { X } from 'lucide-react';
import styles from './ContentTypesManager.module.css';

export interface TypeChipProps {
  readonly label: string;
  readonly onRemove: () => void;
}

/** A refined taxonomy chip; the remove control stays subtle and appears on hover/focus. */
export const TypeChip = ({ label, onRemove }: TypeChipProps): ReactElement => (
  <span className={styles.chip}>
    <span className={styles.chipLabel}>{label}</span>
    <button
      type="button"
      className={styles.chipRemove}
      aria-label={`Remove ${label}`}
      onClick={onRemove}
    >
      <X size={13} aria-hidden="true" />
    </button>
  </span>
);
