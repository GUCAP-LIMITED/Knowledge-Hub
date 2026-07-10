import { Fragment, useState, type ReactElement } from 'react';
import {
  INITIAL_PERMISSION_SETS,
  PERMISSION_MODULES,
  type PermissionSet,
  createPermissionSet,
} from './permission-modules';
import { PermissionSetCards } from './PermissionSetCards';
import { PermissionModuleList } from './PermissionModuleList';
import { PermissionDetail } from './PermissionDetail';
import { NewAccessModal } from './NewAccessModal';
import styles from './AdminSettingsPage.module.css';

/** Granular per-module permission editor, grouped by reusable (and custom) permission sets. */
export const PermissionsTab = (): ReactElement => {
  const [sets, setSets] = useState<readonly PermissionSet[]>(INITIAL_PERMISSION_SETS);
  const [activeSetId, setActiveSetId] = useState('full');
  const [activeModuleId, setActiveModuleId] = useState('courses');
  const [creating, setCreating] = useState(false);

  const activeSet = sets.find((s) => s.id === activeSetId) ?? sets[0];
  const activeModule =
    PERMISSION_MODULES.find((m) => m.id === activeModuleId) ?? PERMISSION_MODULES[0];
  if (activeSet === undefined || activeModule === undefined) {
    return <Fragment />;
  }

  const toggle = (permId: string, value: boolean): void => {
    setSets((prev) =>
      prev.map((set) =>
        set.id === activeSetId
          ? {
              ...set,
              perms: {
                ...set.perms,
                [activeModuleId]: { ...set.perms[activeModuleId], [permId]: value },
              },
            }
          : set,
      ),
    );
  };

  const createSet = (name: string): void => {
    const set = createPermissionSet(name);
    setSets((prev) => [...prev, set]);
    setActiveSetId(set.id);
    setCreating(false);
  };

  const deleteSet = (id: string): void => {
    setSets((prev) => prev.filter((set) => set.id !== id));
    setActiveSetId((current) => (current === id ? 'full' : current));
  };

  return (
    <div className={styles.permWrap}>
      <PermissionSetCards
        sets={sets}
        activeId={activeSetId}
        onSelect={setActiveSetId}
        onCreate={() => {
          setCreating(true);
        }}
        onDelete={deleteSet}
      />
      <div className={styles.permBody}>
        <PermissionModuleList
          perms={activeSet.perms}
          activeModuleId={activeModuleId}
          onSelect={setActiveModuleId}
        />
        <PermissionDetail
          module={activeModule}
          state={activeSet.perms[activeModuleId] ?? {}}
          onToggle={toggle}
        />
      </div>

      <NewAccessModal
        open={creating}
        onClose={() => {
          setCreating(false);
        }}
        onCreate={createSet}
      />
    </div>
  );
};
