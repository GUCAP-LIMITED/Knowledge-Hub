import type { ReactElement } from 'react';
import { RotateCcw, Shield, Trash2 } from 'lucide-react';
import { Button } from '@shared/ui';
import { type CapId, MODULES, countGrid } from './permission-catalog';
import type { PermissionSet } from './permission-sets';
import { ModuleAccessList } from './ModuleAccessList';
import { ModulePermissionGrid } from './ModulePermissionGrid';
import styles from './PermissionSets.module.css';

export interface PermissionSetEditorProps {
  readonly set: PermissionSet;
  readonly activeModuleId: string;
  readonly onSelectModule: (moduleId: string) => void;
  readonly onToggleCap: (moduleId: string, cap: CapId) => void;
  readonly onToggleModule: (moduleId: string, on: boolean) => void;
  readonly onReset: () => void;
  readonly onRemove: (() => void) | undefined;
}

/** The lower half of the Permissions page: edit one permission set module-by-module. */
export const PermissionSetEditor = ({
  set,
  activeModuleId,
  onSelectModule,
  onToggleCap,
  onToggleModule,
  onReset,
  onRemove,
}: PermissionSetEditorProps): ReactElement => {
  const module = MODULES.find((entry) => entry.id === activeModuleId) ?? MODULES[0];
  if (module === undefined) {
    return <p>No modules defined.</p>;
  }
  return (
    <div className={styles.editor}>
      <div className={styles.editorHead}>
        <span className={styles.editorIcon}>
          <Shield size={18} aria-hidden="true" />
        </span>
        <div className={styles.editorTitleWrap}>
          <h3 className={styles.editorTitle}>{set.name}</h3>
          <p className={styles.editorDesc}>
            {set.description} · {countGrid(set.grid)} permissions enabled
          </p>
        </div>
        {onRemove !== undefined ? (
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <Trash2 size={14} aria-hidden="true" /> Delete set
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" /> Reset to default
        </Button>
      </div>

      <div className={styles.editorBody}>
        <ModuleAccessList
          grid={set.grid}
          activeModuleId={module.id}
          onSelect={onSelectModule}
          onToggleModule={onToggleModule}
        />
        <ModulePermissionGrid
          module={module}
          caps={set.grid[module.id] ?? {}}
          onToggle={(cap) => {
            onToggleCap(module.id, cap);
          }}
        />
      </div>
    </div>
  );
};
