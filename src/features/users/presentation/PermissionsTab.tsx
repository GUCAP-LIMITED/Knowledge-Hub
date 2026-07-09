import { Fragment, useState, type ReactElement } from 'react';
import {
  INITIAL_PERMISSION_SETS,
  PERMISSION_MODULES,
  type PermissionSet,
} from './permission-modules';
import { PermissionSetCards } from './PermissionSetCards';
import { PermissionModuleList } from './PermissionModuleList';
import { PermissionDetail } from './PermissionDetail';
import styles from './AdminSettingsPage.module.css';

/** Granular per-module permission editor, grouped by reusable permission sets. */
export const PermissionsTab = (): ReactElement => {
  const [sets, setSets] = useState<readonly PermissionSet[]>(INITIAL_PERMISSION_SETS);
  const [activeSetId, setActiveSetId] = useState('full');
  const [activeModuleId, setActiveModuleId] = useState('courses');

  const activeSet = sets.find((s) => s.id === activeSetId) ?? sets[0];
  const activeModule =
    PERMISSION_MODULES.find((m) => m.id === activeModuleId) ?? PERMISSION_MODULES[0];
  if (activeSet === undefined || activeModule === undefined) {
    return <Fragment />;
  }

  const toggle = (permId: string, value: boolean): void => {
    if (activeSet.locked === true) {
      return;
    }
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

  return (
    <div className={styles.permWrap}>
      <PermissionSetCards sets={sets} activeId={activeSetId} onSelect={setActiveSetId} />
      <div className={styles.permBody}>
        <PermissionModuleList
          perms={activeSet.perms}
          activeModuleId={activeModuleId}
          onSelect={setActiveModuleId}
        />
        <PermissionDetail
          module={activeModule}
          state={activeSet.perms[activeModuleId] ?? {}}
          locked={activeSet.locked === true}
          onToggle={toggle}
        />
      </div>
    </div>
  );
};
