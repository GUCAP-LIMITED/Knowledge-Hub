import type { ReactElement } from 'react';
import { Eye } from 'lucide-react';
import { Switch } from '@shared/ui';
import { cn } from '@shared/utils';
import type { PermissionModule } from '../domain';
import { actionDescription, actionLabel } from './action-labels';
import { iconFor } from './module-icons';
import { byActionOrder } from './permission-set-colors';
import styles from './PermissionsManager.module.css';

export type Grants = Record<string, boolean>;

const grantedCount = (module: PermissionModule, grants: Grants): number =>
  Object.keys(module.permissions).filter((name) => grants[name] === true).length;

interface RailItemProps {
  readonly module: PermissionModule;
  readonly active: boolean;
  readonly grants: Grants;
  readonly onSelect: (id: string) => void;
  readonly onToggleBase: (module: PermissionModule, on: boolean) => void;
}

const RailItem = ({
  module,
  active,
  grants,
  onSelect,
  onToggleBase,
}: RailItemProps): ReactElement => {
  const Icon = iconFor(module.icon);
  const on = grants[module.basePermission] === true;
  return (
    <div className={cn(styles.moduleItem, active && styles.moduleItemActive)}>
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
        className={styles.moduleSelect}
        aria-pressed={active}
        onClick={() => {
          onSelect(module.moduleId);
        }}
      >
        <Icon size={16} aria-hidden className={styles.moduleGlyph} />
        <span className={styles.moduleText}>
          <span className={styles.moduleName}>{module.moduleName}</span>
          <span className={styles.moduleMeta}>
            {on
              ? `${String(grantedCount(module, grants))}/${String(Object.keys(module.permissions).length)} permissions`
              : 'Hidden from sidebar'}
          </span>
        </span>
      </button>
    </div>
  );
};

interface GranularCardProps {
  readonly name: string;
  readonly on: boolean;
  readonly disabled: boolean;
  readonly onToggle: (on: boolean) => void;
}

const GranularCard = ({
  name,
  on,
  disabled,
  onToggle,
}: GranularCardProps): ReactElement => (
  <div
    className={cn(
      styles.granCard,
      on && !disabled && styles.granCardOn,
      disabled && styles.granCardOff,
    )}
  >
    <span className={styles.granText}>
      <span className={styles.granName}>{actionLabel(name)}</span>
      <span className={styles.granDesc}>{actionDescription(name)}</span>
      <span className={styles.requires}>
        Requires <span className={styles.requiresChip}>View</span>
      </span>
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

export interface GranularPaneProps {
  readonly module: PermissionModule;
  readonly grants: Grants;
  readonly onBase: (module: PermissionModule, on: boolean) => void;
  readonly onAction: (name: string, on: boolean) => void;
}

export const GranularPane = ({
  module,
  grants,
  onBase,
  onAction,
}: GranularPaneProps): ReactElement => {
  const Icon = iconFor(module.icon);
  const baseOn = grants[module.basePermission] === true;
  const actions = Object.keys(module.permissions)
    .filter((name) => name !== module.basePermission)
    .sort(byActionOrder);

  return (
    <div className={styles.gridPane}>
      <div className={styles.gridHead}>
        <span className={styles.gridIcon}>
          <Icon size={18} aria-hidden />
        </span>
        <h4 className={styles.gridTitle}>{module.moduleName}</h4>
      </div>

      <span className={styles.detailLabel}>
        Base permission (required for all others)
      </span>
      <div className={cn(styles.baseCard, baseOn && styles.baseCardOn)}>
        <span className={styles.baseIcon}>
          <Eye size={16} aria-hidden />
        </span>
        <span className={styles.granText}>
          <span className={styles.granName}>{actionLabel(module.basePermission)}</span>
          <span className={styles.granDesc}>
            Required for all other {module.moduleName} permissions
          </span>
        </span>
        <span className={styles.requiredPill}>Required</span>
        <Switch
          checked={baseOn}
          label={`${module.moduleName} View`}
          onChange={(on) => {
            onBase(module, on);
          }}
        />
      </div>

      {actions.length > 0 ? (
        <>
          <span className={styles.detailLabel}>
            Granular permissions (depend on base)
          </span>
          <div className={styles.granGrid}>
            {actions.map((name) => (
              <GranularCard
                key={name}
                name={name}
                on={grants[name] === true}
                disabled={!baseOn}
                onToggle={(next) => {
                  onAction(name, next);
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export interface ModuleRailProps {
  readonly modules: readonly PermissionModule[];
  readonly selectedId: string;
  readonly grants: Grants;
  readonly onSelect: (id: string) => void;
  readonly onToggleBase: (module: PermissionModule, on: boolean) => void;
}

export const ModuleRail = ({
  modules,
  selectedId,
  grants,
  onSelect,
  onToggleBase,
}: ModuleRailProps): ReactElement => (
  <div className={styles.moduleList}>
    <span className={styles.railHead}>Module access (sidebar menu)</span>
    {modules.map((module) => (
      <RailItem
        key={module.moduleId}
        module={module}
        active={module.moduleId === selectedId}
        grants={grants}
        onSelect={onSelect}
        onToggleBase={onToggleBase}
      />
    ))}
  </div>
);
