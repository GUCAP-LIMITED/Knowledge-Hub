import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import { type PermissionSet, countEnabled } from './permission-modules';
import styles from './AdminSettingsPage.module.css';

export interface PermissionSetCardsProps {
  readonly sets: readonly PermissionSet[];
  readonly activeId: string;
  readonly onSelect: (id: string) => void;
}

/** Selectable cards for each editable permission set. */
export const PermissionSetCards = ({
  sets,
  activeId,
  onSelect,
}: PermissionSetCardsProps): ReactElement => (
  <div className={styles.setCards}>
    {sets.map((set) => (
      <button
        key={set.id}
        type="button"
        className={cn(styles.setCard, activeId === set.id && styles.setCardActive)}
        onClick={() => {
          onSelect(set.id);
        }}
      >
        <span className={styles.setCardHead}>
          <span className={styles.setCardLabel}>{set.label}</span>
        </span>
        <span className={styles.setCardDesc}>{set.desc}</span>
        <span className={styles.setCardCount}>
          {countEnabled(set)} permissions enabled
        </span>
      </button>
    ))}
  </div>
);
