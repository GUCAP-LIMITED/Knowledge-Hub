import { type ReactElement, useMemo, useState } from 'react';
import { Eye, Save, Shield } from 'lucide-react';
import { Alert, Button, Switch } from '@shared/ui';
import { cn } from '@shared/utils';
import type { PermissionModule, PermissionSetDetail } from '../domain';
import { actionDescription, actionLabel } from './action-labels';
import { iconFor } from './module-icons';
import { byActionOrder } from './permission-set-colors';
import { flattenModules, toGrantMap } from './permission-tree';
import { useUpdatePermissionSet } from './use-permissions';
import styles from './PermissionsManager.module.css';

type Grants = Record<string, boolean>;

const editableModules = (detail: PermissionSetDetail): readonly PermissionModule[] =>
  flattenModules(detail.permissionModules).filter(
    (module) => Object.keys(module.permissions).length > 0,
  );

const grantedCount = (module: PermissionModule, grants: Grants): number =>
  Object.keys(module.permissions).filter((name) => grants[name] === true).length;

const RailItem = ({
  module,
  active,
  grants,
  onSelect,
  onToggleBase,
}: {
  readonly module: PermissionModule;
  readonly active: boolean;
  readonly grants: Grants;
  readonly onSelect: (id: string) => void;
  readonly onToggleBase: (module: PermissionModule, on: boolean) => void;
}): ReactElement => {
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

const GranularCard = ({
  name,
  on,
  disabled,
  onToggle,
}: {
  readonly name: string;
  readonly on: boolean;
  readonly disabled: boolean;
  readonly onToggle: (on: boolean) => void;
}): ReactElement => (
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

const GranularPane = ({
  module,
  grants,
  onBase,
  onAction,
}: {
  readonly module: PermissionModule;
  readonly grants: Grants;
  readonly onBase: (module: PermissionModule, on: boolean) => void;
  readonly onAction: (name: string, on: boolean) => void;
}): ReactElement => {
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

/** Two-pane editor for one permission set: module rail (left) + granular grid (right). */
export const PermissionSetEditor = ({
  detail,
}: {
  readonly detail: PermissionSetDetail;
}): ReactElement => {
  const updateSet = useUpdatePermissionSet();
  const modules = useMemo(() => editableModules(detail), [detail]);
  const [grants, setGrants] = useState<Grants>(() =>
    toGrantMap(detail.permissionModules),
  );
  const [selectedId, setSelectedId] = useState<string>(() => modules[0]?.moduleId ?? '');
  const selected = modules.find((module) => module.moduleId === selectedId) ?? modules[0];
  const enabled = Object.keys(grants).filter((key) => grants[key]).length;

  const setBase = (module: PermissionModule, on: boolean): void => {
    setGrants((current) => {
      const next: Grants = { ...current, [module.basePermission]: on };
      if (!on) {
        for (const name of Object.keys(module.permissions)) next[name] = false;
      }
      return next;
    });
  };
  const setAction = (name: string, on: boolean): void => {
    setGrants((current) => ({ ...current, [name]: on }));
  };
  const onSave = (): void => {
    updateSet.mutate({
      id: detail.id,
      input: {
        name: detail.name,
        description: detail.description,
        color: detail.color,
        bgColor: detail.bgColor,
        permissions: grants,
      },
    });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.editorHead}>
        <span className={styles.editorIcon}>
          <Shield size={18} aria-hidden />
        </span>
        <div className={styles.editorTitleWrap}>
          <h3 className={styles.editorTitle}>{detail.name}</h3>
          <p className={styles.editorDesc}>
            {detail.description !== null ? `${detail.description} · ` : ''}
            {enabled} permissions enabled
          </p>
        </div>
        <Button size="sm" onClick={onSave} isLoading={updateSet.isPending}>
          <Save size={14} aria-hidden /> Save changes
        </Button>
      </div>

      {updateSet.isError ? (
        <Alert tone="error" title="Could not save">
          {updateSet.error.message}
        </Alert>
      ) : null}

      <div className={styles.editorBody}>
        <div className={styles.moduleList}>
          <span className={styles.railHead}>Module access (sidebar menu)</span>
          {modules.map((module) => (
            <RailItem
              key={module.moduleId}
              module={module}
              active={module.moduleId === selected?.moduleId}
              grants={grants}
              onSelect={setSelectedId}
              onToggleBase={setBase}
            />
          ))}
        </div>

        {selected !== undefined ? (
          <GranularPane
            module={selected}
            grants={grants}
            onBase={setBase}
            onAction={setAction}
          />
        ) : (
          <p className={styles.gridEmpty}>No modules to configure.</p>
        )}
      </div>
    </div>
  );
};
