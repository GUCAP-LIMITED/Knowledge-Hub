import type { ReactElement } from 'react';
import { Switch } from '@shared/ui';
import type { PermissionModule, UserEffectivePermissions } from '../domain';
import { actionLabel } from './action-labels';
import { iconFor } from './module-icons';
import { byActionOrder } from './permission-set-colors';
import styles from './UserPermissionsEditor.module.css';

type Grants = Record<string, boolean>;
type Source = 'role' | 'direct' | 'denied';

/** Where a capability's *loaded* state comes from — deny wins, then direct grant, then role. */
const sourceOf = (name: string, data: UserEffectivePermissions): Source =>
  data.deniedPermissions.includes(name)
    ? 'denied'
    : data.directGrantedPermissions.includes(name)
      ? 'direct'
      : 'role';

const CapRow = ({
  name,
  on,
  source,
  disabled,
  isReset,
  onToggle,
  onReset,
}: {
  readonly name: string;
  readonly on: boolean;
  readonly source: Source;
  readonly disabled: boolean;
  readonly isReset: boolean;
  readonly onToggle: (on: boolean) => void;
  readonly onReset: () => void;
}): ReactElement => {
  const overridden = !isReset && source !== 'role';
  const state = on ? 'Enabled' : 'Disabled';
  return (
    <div className={styles.capRow}>
      <div className={styles.capText}>
        <span className={styles.capName}>
          {actionLabel(name)}
          {overridden ? (
            <span className={source === 'denied' ? styles.deniedTag : styles.overrideTag}>
              {source === 'denied' ? 'Denied' : 'Override'}
            </span>
          ) : null}
        </span>
        <span className={styles.capSource}>
          {overridden
            ? `${source === 'denied' ? 'Denied' : 'Direct grant'}: ${state}`
            : `From role: ${state}`}
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
        label={actionLabel(name)}
        onChange={onToggle}
      />
    </div>
  );
};

export interface OverridePermissionCardProps {
  readonly module: PermissionModule;
  readonly grants: Grants;
  readonly data: UserEffectivePermissions;
  readonly resetCaps: ReadonlySet<string>;
  readonly onToggle: (module: PermissionModule, name: string, on: boolean) => void;
  readonly onReset: (name: string) => void;
}

/** One module's block in the per-user editor: base + granular caps, each with provenance and reset. */
export const OverridePermissionCard = ({
  module,
  grants,
  data,
  resetCaps,
  onToggle,
  onReset,
}: OverridePermissionCardProps): ReactElement => {
  const Icon = iconFor(module.icon);
  const baseOn = grants[module.basePermission] === true;
  const caps = [
    module.basePermission,
    ...Object.keys(module.permissions)
      .filter((name) => name !== module.basePermission)
      .sort(byActionOrder),
  ];
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleCardHead}>
        <Icon size={15} aria-hidden="true" className={styles.moduleCardIcon} />
        <span className={styles.moduleCardLabel}>{module.moduleName}</span>
      </div>
      {caps.map((name) => (
        <CapRow
          key={name}
          name={name}
          on={grants[name] === true}
          source={sourceOf(name, data)}
          disabled={name !== module.basePermission && !baseOn}
          isReset={resetCaps.has(name)}
          onToggle={(next) => {
            onToggle(module, name, next);
          }}
          onReset={() => {
            onReset(name);
          }}
        />
      ))}
    </div>
  );
};
