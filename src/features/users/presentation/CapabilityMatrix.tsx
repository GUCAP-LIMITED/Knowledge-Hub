import type { ReactElement } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@shared/utils';
import {
  CAP_LABEL,
  type CapId,
  MODULES,
  type PermissionModule,
  type PermissionMatrix,
} from './role-permissions-model';
import styles from './RolePermissions.module.css';

export interface CapabilityMatrixProps {
  readonly roleId: string;
  readonly matrix: PermissionMatrix;
  readonly onToggle: (moduleId: string, cap: CapId) => void;
  readonly onSetModule: (moduleId: string, caps: readonly CapId[], on: boolean) => void;
}

const ModuleRow = ({
  module,
  granted,
  onToggle,
  onSetModule,
}: {
  readonly module: PermissionModule;
  readonly granted: Partial<Record<CapId, boolean>>;
  readonly onToggle: (cap: CapId) => void;
  readonly onSetModule: (on: boolean) => void;
}): ReactElement => {
  const Icon = module.icon;
  const allOn = module.capabilities.every((cap) => granted[cap] === true);
  return (
    <div className={styles.moduleRow}>
      <div className={styles.moduleHead}>
        <span className={styles.moduleIcon}>
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className={styles.moduleLabel}>{module.label}</span>
        <button
          type="button"
          className={styles.moduleAll}
          onClick={() => {
            onSetModule(!allOn);
          }}
        >
          {allOn ? 'Clear all' : 'Grant all'}
        </button>
      </div>
      <div className={styles.caps}>
        {module.capabilities.map((cap) => {
          const on = granted[cap] === true;
          return (
            <button
              key={cap}
              type="button"
              aria-pressed={on}
              className={cn(styles.cap, on && styles.capOn)}
              onClick={() => {
                onToggle(cap);
              }}
            >
              <span className={cn(styles.capBox, on && styles.capBoxOn)}>
                {on ? <Check size={11} aria-hidden="true" /> : null}
              </span>
              {CAP_LABEL[cap]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** The per-role capability grid: one row per module, a toggle per capability. */
export const CapabilityMatrix = ({
  roleId,
  matrix,
  onToggle,
  onSetModule,
}: CapabilityMatrixProps): ReactElement => (
  <div className={styles.matrix}>
    {MODULES.map((module) => (
      <ModuleRow
        key={module.id}
        module={module}
        granted={matrix[roleId]?.[module.id] ?? {}}
        onToggle={(cap) => {
          onToggle(module.id, cap);
        }}
        onSetModule={(on) => {
          onSetModule(module.id, module.capabilities, on);
        }}
      />
    ))}
  </div>
);
