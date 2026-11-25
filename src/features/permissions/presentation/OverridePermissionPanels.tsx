import type { ReactElement } from 'react';
import { Eye } from 'lucide-react';
import { Button, Switch } from '@shared/ui';
import { cn } from '@shared/utils';
import type { PermissionModule, UserEffectivePermissions } from '../domain';
import { actionDescription, actionLabel } from './action-labels';
import { iconFor } from './module-icons';
import { byActionOrder } from './permission-set-colors';
import managerStyles from './PermissionsManager.module.css';
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

const isOverridden = (
  name: string,
  data: UserEffectivePermissions,
  resetCaps: ReadonlySet<string>,
): boolean => !resetCaps.has(name) && sourceOf(name, data) !== 'role';

const overrideCount = (
  module: PermissionModule,
  data: UserEffectivePermissions,
  resetCaps: ReadonlySet<string>,
): number =>
  Object.keys(module.permissions).filter((name) => isOverridden(name, data, resetCaps))
    .length;

const grantedCount = (module: PermissionModule, grants: Grants): number =>
  Object.keys(module.permissions).filter((name) => grants[name] === true).length;

const OverrideTag = ({ source }: { readonly source: Source }): ReactElement => (
  <span className={source === 'denied' ? styles.deniedTag : styles.overrideTag}>
    {source === 'denied' ? 'Denied' : 'Override'}
  </span>
);

export interface ModuleRailItemProps {
  readonly module: PermissionModule;
  readonly active: boolean;
  readonly grants: Grants;
  readonly data: UserEffectivePermissions;
  readonly resetCaps: ReadonlySet<string>;
  readonly onSelect: (id: string) => void;
  readonly onToggleBase: (module: PermissionModule, on: boolean) => void;
}

/** One module row in the left rail: module-access switch, select button, and an override-count dot. */
export const ModuleRailItem = ({
  module,
  active,
  grants,
  data,
  resetCaps,
  onSelect,
  onToggleBase,
}: ModuleRailItemProps): ReactElement => {
  const Icon = iconFor(module.icon);
  const on = grants[module.basePermission] === true;
  const overridden = overrideCount(module, data, resetCaps);
  return (
    <div
      className={cn(managerStyles.moduleItem, active && managerStyles.moduleItemActive)}
    >
      <Switch
        size="sm"
        checked={on}
        label={`${module.moduleName} access`}
        onChange={(next) => {
          onToggleBase(module, next);
        }}
      />
      <button
        type="button"
        className={managerStyles.moduleSelect}
        aria-pressed={active}
        onClick={() => {
          onSelect(module.moduleId);
        }}
      >
        <Icon size={16} aria-hidden className={managerStyles.moduleGlyph} />
        <span className={managerStyles.moduleText}>
          <span className={managerStyles.moduleName}>
            {module.moduleName}
            {overridden > 0 ? (
              <span
                className={styles.overrideDot}
                aria-label={`${String(overridden)} overridden permission${overridden === 1 ? '' : 's'}`}
              />
            ) : null}
          </span>
          <span className={managerStyles.moduleMeta}>
            {on
              ? `${String(grantedCount(module, grants))}/${String(Object.keys(module.permissions).length)} permissions`
              : 'Hidden from sidebar'}
          </span>
        </span>
      </button>
    </div>
  );
};

const CapCard = ({
  name,
  grants,
  data,
  resetCaps,
  disabled,
  onToggle,
  onReset,
}: {
  readonly name: string;
  readonly grants: Grants;
  readonly data: UserEffectivePermissions;
  readonly resetCaps: ReadonlySet<string>;
  readonly disabled: boolean;
  readonly onToggle: (on: boolean) => void;
  readonly onReset: () => void;
}): ReactElement => {
  const on = grants[name] === true;
  const source = sourceOf(name, data);
  const overridden = isOverridden(name, data, resetCaps);
  return (
    <div
      className={cn(
        managerStyles.granCard,
        on && !disabled && managerStyles.granCardOn,
        disabled && managerStyles.granCardOff,
      )}
    >
      <span className={managerStyles.granText}>
        <span className={managerStyles.granName}>
          {actionLabel(name)}
          {overridden ? <OverrideTag source={source} /> : null}
        </span>
        <span className={managerStyles.granDesc}>{actionDescription(name)}</span>
        {overridden ? (
          <Button variant="link" size="xs" className={styles.resetLink} onClick={onReset}>
            Reset to role default
          </Button>
        ) : (
          <span className={managerStyles.requires}>
            From role:{' '}
            <span className={managerStyles.requiresChip}>{on ? 'On' : 'Off'}</span>
          </span>
        )}
      </span>
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

const BaseCapabilityCard = ({
  module,
  grants,
  data,
  resetCaps,
  onBase,
  onReset,
}: {
  readonly module: PermissionModule;
  readonly grants: Grants;
  readonly data: UserEffectivePermissions;
  readonly resetCaps: ReadonlySet<string>;
  readonly onBase: (module: PermissionModule, on: boolean) => void;
  readonly onReset: (name: string) => void;
}): ReactElement => {
  const baseOn = grants[module.basePermission] === true;
  const baseSource = sourceOf(module.basePermission, data);
  const baseOverridden = isOverridden(module.basePermission, data, resetCaps);
  return (
    <div className={cn(managerStyles.baseCard, baseOn && managerStyles.baseCardOn)}>
      <span className={managerStyles.baseIcon}>
        <Eye size={16} aria-hidden />
      </span>
      <span className={managerStyles.granText}>
        <span className={managerStyles.granName}>
          {actionLabel(module.basePermission)}
          {baseOverridden ? <OverrideTag source={baseSource} /> : null}
        </span>
        <span className={managerStyles.granDesc}>
          Required for all other {module.moduleName} permissions
        </span>
        {baseOverridden ? (
          <Button
            variant="link"
            size="xs"
            className={styles.resetLink}
            onClick={() => {
              onReset(module.basePermission);
            }}
          >
            Reset to role default
          </Button>
        ) : null}
      </span>
      <span className={managerStyles.requiredPill}>Required</span>
      <Switch
        checked={baseOn}
        label={`${module.moduleName} View`}
        onChange={(on) => {
          onBase(module, on);
        }}
      />
    </div>
  );
};

export interface OverrideGranularPaneProps {
  readonly module: PermissionModule;
  readonly grants: Grants;
  readonly data: UserEffectivePermissions;
  readonly resetCaps: ReadonlySet<string>;
  readonly onBase: (module: PermissionModule, on: boolean) => void;
  readonly onAction: (name: string, on: boolean) => void;
  readonly onReset: (name: string) => void;
}

/**
 * Right-hand pane for the selected module: base permission plus granular capabilities, each
 * showing whether it's inherited from the role or overridden, with a per-capability reset.
 */
export const OverrideGranularPane = ({
  module,
  grants,
  data,
  resetCaps,
  onBase,
  onAction,
  onReset,
}: OverrideGranularPaneProps): ReactElement => {
  const Icon = iconFor(module.icon);
  const baseOn = grants[module.basePermission] === true;
  const actions = Object.keys(module.permissions)
    .filter((name) => name !== module.basePermission)
    .sort(byActionOrder);

  return (
    <div className={managerStyles.gridPane}>
      <div className={managerStyles.gridHead}>
        <span className={managerStyles.gridIcon}>
          <Icon size={18} aria-hidden />
        </span>
        <h4 className={managerStyles.gridTitle}>{module.moduleName}</h4>
      </div>

      <span className={managerStyles.detailLabel}>
        Base permission (required for all others)
      </span>
      <BaseCapabilityCard
        module={module}
        grants={grants}
        data={data}
        resetCaps={resetCaps}
        onBase={onBase}
        onReset={onReset}
      />

      {actions.length > 0 ? (
        <>
          <span className={managerStyles.detailLabel}>
            Granular permissions (depend on base)
          </span>
          <div className={managerStyles.granGrid}>
            {actions.map((name) => (
              <CapCard
                key={name}
                name={name}
                grants={grants}
                data={data}
                resetCaps={resetCaps}
                disabled={!baseOn}
                onToggle={(next) => {
                  onAction(name, next);
                }}
                onReset={() => {
                  onReset(name);
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};
