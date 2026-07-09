import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import { PERMISSION_MODULES, type PermState } from './permission-modules';
import styles from './AdminSettingsPage.module.css';

const enabledCount = (
  moduleId: string,
  perms: PermState,
): { readonly on: number; readonly total: number } => {
  const mod = PERMISSION_MODULES.find((m) => m.id === moduleId);
  if (mod === undefined) {
    return { on: 0, total: 0 };
  }
  const ids = [mod.base.id, ...mod.granular.map((g) => g.id)];
  const state = perms[moduleId] ?? {};
  return { on: ids.filter((id) => state[id] === true).length, total: ids.length };
};

export interface PermissionModuleListProps {
  readonly perms: PermState;
  readonly activeModuleId: string;
  readonly onSelect: (id: string) => void;
}

/** Sidebar list of permission modules with per-module enabled counts. */
export const PermissionModuleList = ({
  perms,
  activeModuleId,
  onSelect,
}: PermissionModuleListProps): ReactElement => (
  <div className={styles.moduleList}>
    {PERMISSION_MODULES.map((mod) => {
      const count = enabledCount(mod.id, perms);
      const Icon = mod.icon;
      return (
        <button
          key={mod.id}
          type="button"
          className={cn(
            styles.moduleRow,
            activeModuleId === mod.id && styles.moduleRowActive,
          )}
          onClick={() => {
            onSelect(mod.id);
          }}
        >
          <Icon size={16} aria-hidden="true" />
          <span className={styles.moduleName}>{mod.label}</span>
          <span className={styles.moduleCount}>
            {count.on}/{count.total}
          </span>
        </button>
      );
    })}
  </div>
);
