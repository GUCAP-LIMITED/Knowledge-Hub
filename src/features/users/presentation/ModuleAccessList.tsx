import type { ReactElement } from 'react';
import { Switch } from '@shared/ui';
import { cn } from '@shared/utils';
import {
  BASE_CAP,
  MODULES,
  type PermissionGrid,
  countModuleGrants,
  moduleTotal,
} from './permission-catalog';
import styles from './PermissionSets.module.css';

export interface ModuleAccessListProps {
  readonly grid: PermissionGrid;
  readonly activeModuleId: string;
  readonly onSelect: (moduleId: string) => void;
  readonly onToggleModule: (moduleId: string, on: boolean) => void;
}

/** Left rail of the set editor: one row per module with a master access switch + grant count. */
export const ModuleAccessList = ({
  grid,
  activeModuleId,
  onSelect,
  onToggleModule,
}: ModuleAccessListProps): ReactElement => (
  <div className={styles.moduleList}>
    <span className={styles.railHead}>Module access (sidebar menu)</span>
    {MODULES.map((module) => {
      const Icon = module.icon;
      const active = module.id === activeModuleId;
      const on = grid[module.id]?.[BASE_CAP] === true;
      return (
        <div
          key={module.id}
          className={cn(styles.moduleItem, active && styles.moduleItemActive)}
        >
          <Switch
            size="sm"
            checked={on}
            label={`${module.label} access`}
            onChange={(next) => {
              onToggleModule(module.id, next);
            }}
          />
          <button
            type="button"
            className={styles.moduleSelect}
            aria-pressed={active}
            onClick={() => {
              onSelect(module.id);
            }}
          >
            <Icon size={16} aria-hidden="true" className={styles.moduleGlyph} />
            <span className={styles.moduleText}>
              <span className={styles.moduleName}>{module.label}</span>
              <span className={styles.moduleMeta}>
                {countModuleGrants(grid, module.id)}/{moduleTotal(module.id)} permissions
              </span>
            </span>
          </button>
        </div>
      );
    })}
  </div>
);
