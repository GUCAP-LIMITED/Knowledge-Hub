import type { ReactElement } from 'react';
import { Plus, X } from 'lucide-react';
import { IconButton } from '@shared/ui';
import { cn } from '@shared/utils';
import { type PermissionSet, countEnabled } from './permission-modules';
import styles from './AdminSettingsPage.module.css';

export interface PermissionSetCardsProps {
  readonly sets: readonly PermissionSet[];
  readonly activeId: string;
  readonly onSelect: (id: string) => void;
  readonly onCreate: () => void;
  readonly onDelete: (id: string) => void;
}

const isCustom = (id: string): boolean => id.startsWith('custom-');

/** Selectable cards for each editable permission set, plus a "new access level" tile. */
export const PermissionSetCards = ({
  sets,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: PermissionSetCardsProps): ReactElement => (
  <div className={styles.setCards}>
    {sets.map((set) => (
      <div key={set.id} className={styles.setCardWrap}>
        <button
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
        {isCustom(set.id) ? (
          <IconButton
            label={`Delete ${set.label}`}
            variant="danger"
            className={styles.setCardRemove}
            onClick={() => {
              onDelete(set.id);
            }}
          >
            <X size={13} aria-hidden />
          </IconButton>
        ) : null}
      </div>
    ))}
    <button
      type="button"
      className={cn(styles.setCard, styles.setCardNew)}
      onClick={onCreate}
    >
      <Plus size={18} aria-hidden />
      <span className={styles.setCardLabel}>New access level</span>
    </button>
  </div>
);
