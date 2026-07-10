import type { ReactElement } from 'react';
import { Switch } from '@shared/ui';
import {
  BASE_CAP,
  CAP_LABEL,
  type CapId,
  type PermissionGrid,
  type PermissionModule,
} from './permission-catalog';
import { type PermissionSet, effectiveValue, hasOverride } from './permission-sets';
import styles from './EditPermissions.module.css';

export interface OverrideModuleCardProps {
  readonly module: PermissionModule;
  readonly base: PermissionSet;
  readonly overrides: PermissionGrid;
  readonly onToggle: (cap: CapId) => void;
  readonly onReset: (cap: CapId) => void;
}

const CapRow = ({
  cap,
  on,
  overridden,
  baseName,
  disabled,
  onToggle,
  onReset,
}: {
  readonly cap: CapId;
  readonly on: boolean;
  readonly overridden: boolean;
  readonly baseName: string;
  readonly disabled: boolean;
  readonly onToggle: () => void;
  readonly onReset: () => void;
}): ReactElement => (
  <div className={styles.capRow}>
    <div className={styles.capText}>
      <span className={styles.capName}>
        {CAP_LABEL[cap]}
        {overridden ? <span className={styles.overrideTag}>Override</span> : null}
      </span>
      <span className={styles.capSource}>
        {overridden
          ? `Override: ${on ? 'Enabled' : 'Disabled'}`
          : `From ${baseName}: ${on ? 'Enabled' : 'Disabled'}`}
      </span>
    </div>
    {overridden ? (
      <button type="button" className={styles.resetLink} onClick={onReset}>
        Reset
      </button>
    ) : null}
    <Switch
      size="sm"
      checked={on}
      disabled={disabled}
      label={CAP_LABEL[cap]}
      onChange={onToggle}
    />
  </div>
);

/** One module's block inside the per-user override modal, with provenance and reset per capability. */
export const OverrideModuleCard = ({
  module,
  base,
  overrides,
  onToggle,
  onReset,
}: OverrideModuleCardProps): ReactElement => {
  const Icon = module.icon;
  const viewOn = effectiveValue(base, overrides, module.id, BASE_CAP);
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleCardHead}>
        <Icon size={15} aria-hidden="true" className={styles.moduleCardIcon} />
        <span className={styles.moduleCardLabel}>{module.label}</span>
      </div>
      {module.capabilities.map((cap) => (
        <CapRow
          key={cap}
          cap={cap}
          on={effectiveValue(base, overrides, module.id, cap)}
          overridden={hasOverride(overrides, module.id, cap)}
          baseName={base.name}
          disabled={cap !== BASE_CAP && !viewOn}
          onToggle={() => {
            onToggle(cap);
          }}
          onReset={() => {
            onReset(cap);
          }}
        />
      ))}
    </div>
  );
};
