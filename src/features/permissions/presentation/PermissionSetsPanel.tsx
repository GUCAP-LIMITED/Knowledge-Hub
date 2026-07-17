import { type ReactElement, useState } from 'react';
import { Check, Pencil, Plus, Shield } from 'lucide-react';
import { DeleteConfirmDialog } from '@shared/ui';
import { cn } from '@shared/utils';
import type { PermissionSetSummary } from '../domain';
import { DEFAULT_PERMISSION_SET_COLOR } from './permission-set-colors';
import { PermissionSetFormModal } from './PermissionSetFormModal';
import { useDeletePermissionSet } from './use-permissions';
import styles from './PermissionsManager.module.css';

export interface PermissionSetsPanelProps {
  readonly sets: readonly PermissionSetSummary[];
  readonly activeSetId: string;
  readonly onSelect: (id: string) => void;
}

const SetCard = ({
  set,
  active,
  onSelect,
  onEdit,
}: {
  readonly set: PermissionSetSummary;
  readonly active: boolean;
  readonly onSelect: () => void;
  readonly onEdit: () => void;
}): ReactElement => {
  const color = set.color ?? DEFAULT_PERMISSION_SET_COLOR.color;
  const bgColor = set.bgColor ?? DEFAULT_PERMISSION_SET_COLOR.bgColor;
  return (
    <div className={cn(styles.card, active && styles.cardActive)}>
      <button
        type="button"
        className={styles.cardSelect}
        aria-pressed={active}
        onClick={onSelect}
      >
        <span className={styles.cardTop}>
          <span className={styles.cardIcon} style={{ backgroundColor: bgColor }}>
            <Shield size={18} aria-hidden style={{ color }} />
            {active ? (
              <span className={styles.cardCheck}>
                <Check size={12} aria-hidden />
              </span>
            ) : null}
          </span>
        </span>
        <span className={styles.cardName}>{set.name}</span>
        <span className={styles.cardDesc}>{set.description}</span>
        <span className={styles.cardCount}>
          {set.enabledCount} of {set.totalCount} permissions
        </span>
      </button>
      <button
        type="button"
        className={styles.cardEdit}
        aria-label={`Edit ${set.name}`}
        onClick={onEdit}
      >
        <Pencil size={14} aria-hidden />
      </button>
    </div>
  );
};

const SetCardGrid = ({
  sets,
  activeSetId,
  onSelect,
  onEdit,
  onAdd,
}: {
  readonly sets: readonly PermissionSetSummary[];
  readonly activeSetId: string;
  readonly onSelect: (id: string) => void;
  readonly onEdit: (set: PermissionSetSummary) => void;
  readonly onAdd: () => void;
}): ReactElement => (
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
        <Plus size={22} aria-hidden />
      </span>
      <span className={styles.addTitle}>Add New Permission Group</span>
      <span className={styles.addSub}>Create a custom permission set</span>
    </button>
  </div>
);

/** Grid of permission-set cards + the dashed "Add New" tile. Selecting a card opens its editor. */
export const PermissionSetsPanel = ({
  sets,
  activeSetId,
  onSelect,
}: PermissionSetsPanelProps): ReactElement => {
  const deleteSet = useDeletePermissionSet();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PermissionSetSummary | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PermissionSetSummary | null>(null);

  return (
    <section>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>Permission Sets</h3>
      </div>

      <SetCardGrid
        sets={sets}
        activeSetId={activeSetId}
        onSelect={onSelect}
        onEdit={setEditing}
        onAdd={() => {
          setCreating(true);
        }}
      />

      {creating ? (
        <PermissionSetFormModal
          open
          onClose={() => {
            setCreating(false);
          }}
        />
      ) : null}

      {editing !== null ? (
        <PermissionSetFormModal
          open
          initial={editing}
          onClose={() => {
            setEditing(null);
          }}
          {...(editing.isSystemDefault
            ? {}
            : {
                onRequestDelete: (): void => {
                  setPendingDelete(editing);
                  setEditing(null);
                },
              })}
        />
      ) : null}

      <DeleteConfirmDialog
        item={
          pendingDelete !== null
            ? { id: pendingDelete.id, title: pendingDelete.name }
            : null
        }
        noun="permission set"
        isBusy={deleteSet.isPending}
        onConfirm={(id) => {
          deleteSet.mutate(id, {
            onSettled: () => {
              setPendingDelete(null);
            },
          });
        }}
        onCancel={() => {
          setPendingDelete(null);
        }}
      />
    </section>
  );
};
