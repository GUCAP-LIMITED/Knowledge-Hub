import type { ReactElement } from 'react';
import { Check, Pencil, Plus, Shield } from 'lucide-react';
import { cn } from '@shared/utils';
import { countGrid } from './permission-catalog';
import type { PermissionSet } from './permission-sets';
import styles from './PermissionSets.module.css';

export interface PermissionSetCardsProps {
  readonly sets: readonly PermissionSet[];
  readonly activeSetId: string;
  readonly onSelect: (setId: string) => void;
  readonly onEdit: (set: PermissionSet) => void;
  readonly onAdd: () => void;
}

const SetCard = ({
  set,
  active,
  onSelect,
  onEdit,
}: {
  readonly set: PermissionSet;
  readonly active: boolean;
  readonly onSelect: () => void;
  readonly onEdit: () => void;
}): ReactElement => (
  <div className={cn(styles.card, active && styles.cardActive)}>
    <button
      type="button"
      className={styles.cardSelect}
      aria-pressed={active}
      onClick={onSelect}
    >
      <span className={styles.cardTop}>
        <span className={styles.cardIcon}>
          <Shield size={18} aria-hidden="true" />
          {active ? (
            <span className={styles.cardCheck}>
              <Check size={12} aria-hidden="true" />
            </span>
          ) : null}
        </span>
      </span>
      <span className={styles.cardName}>{set.name}</span>
      <span className={styles.cardDesc}>{set.description}</span>
      <span className={styles.cardCount}>{countGrid(set.grid)} permissions enabled</span>
    </button>
    <button
      type="button"
      className={styles.cardEdit}
      aria-label={`Rename ${set.name}`}
      onClick={onEdit}
    >
      <Pencil size={14} aria-hidden="true" />
    </button>
  </div>
);

/** The row of permission-set cards at the top of the Permissions page, plus the add tile. */
export const PermissionSetCards = ({
  sets,
  activeSetId,
  onSelect,
  onEdit,
  onAdd,
}: PermissionSetCardsProps): ReactElement => (
  <div className={styles.cards}>
    {sets.map((set) => (
      <SetCard
        key={set.id}
        set={set}
        active={set.id === activeSetId}
        onSelect={() => {
          onSelect(set.id);
        }}
        onEdit={() => {
          onEdit(set);
        }}
      />
    ))}
    <button type="button" className={styles.addCard} onClick={onAdd}>
      <span className={styles.addIcon}>
        <Plus size={20} aria-hidden="true" />
      </span>
      <span className={styles.addTitle}>Add permission set</span>
      <span className={styles.addSub}>Create a custom access level</span>
    </button>
  </div>
);
