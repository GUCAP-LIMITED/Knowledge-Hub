import type { ReactElement } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@shared/utils';
import { type PermissionSet, countEnabled } from './permission-modules';
import styles from './AdminSettingsPage.module.css';

export interface PermissionSetCardsProps {
  readonly sets: readonly PermissionSet[];
  readonly activeId: string;
  readonly onSelect: (id: string) => void;
}

/** Selectable cards for each permission set (Full Access is locked). */
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
          {set.locked === true ? (
            <span className={styles.lockBadge}>
              <Lock size={11} aria-hidden="true" /> Locked
            </span>
          ) : null}
        </span>
        <span className={styles.setCardDesc}>{set.desc}</span>
        <span className={styles.setCardCount}>
          {countEnabled(set)} permissions enabled
        </span>
      </button>
    ))}
  </div>
);
