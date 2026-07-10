import { useState, type ReactElement } from 'react';
import { MODULES } from './permission-catalog';
import type { PermissionSet } from './permission-sets';
import { usePermissionSets } from './use-permission-sets';
import { PermissionSetCards } from './PermissionSetCards';
import { PermissionSetEditor } from './PermissionSetEditor';
import { PermissionSetRenameModal } from './PermissionSetRenameModal';
import styles from './PermissionSets.module.css';

const FIRST_MODULE = MODULES[0]?.id ?? 'courses';

/** Permissions page: named permission sets (cards) plus a module-by-module set editor. */
export const PermissionSets = (): ReactElement => {
  const sets = usePermissionSets((s) => s.sets);
  const store = usePermissionSets();
  const [activeSetId, setActiveSetId] = useState(sets[0]?.id ?? 'full-access');
  const [activeModuleId, setActiveModuleId] = useState(FIRST_MODULE);
  const [editing, setEditing] = useState<PermissionSet | null>(null);

  const activeSet = sets.find((set) => set.id === activeSetId) ?? sets[0];
  if (activeSet === undefined) {
    return <p>No permission sets defined.</p>;
  }

  const closeEdit = (): void => {
    setEditing(null);
  };

  return (
    <div className={styles.page}>
      <p className={styles.lead}>
        Group capabilities into reusable access levels, then assign a set to each person
        from the Users directory. Turning a module off clears every permission beneath it.
      </p>

      <PermissionSetCards
        sets={sets}
        activeSetId={activeSet.id}
        onSelect={setActiveSetId}
        onEdit={setEditing}
        onAdd={store.addSet}
      />

      <PermissionSetEditor
        set={activeSet}
        activeModuleId={activeModuleId}
        onSelectModule={setActiveModuleId}
        onToggleCap={(moduleId, cap) => {
          store.toggleSetCap(activeSet.id, moduleId, cap);
        }}
        onToggleModule={(moduleId, on) => {
          store.setSetModule(activeSet.id, moduleId, on);
        }}
        onReset={() => {
          store.resetSet(activeSet.id);
        }}
        onRemove={
          activeSet.custom
            ? (): void => {
                store.removeSet(activeSet.id);
                setActiveSetId(sets[0]?.id ?? 'full-access');
              }
            : undefined
        }
      />

      <PermissionSetRenameModal
        set={editing}
        onClose={closeEdit}
        onSave={(name, description) => {
          if (editing !== null) {
            store.renameSet(editing.id, name, description);
          }
          closeEdit();
        }}
        onDelete={
          editing?.custom === true
            ? (): void => {
                const id = editing.id;
                store.removeSet(id);
                if (activeSetId === id) {
                  setActiveSetId(sets[0]?.id ?? 'full-access');
                }
                closeEdit();
              }
            : undefined
        }
      />
    </div>
  );
};
