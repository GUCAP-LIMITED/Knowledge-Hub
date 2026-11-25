import { type ReactElement, useMemo, useState } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { Alert, Button, Modal, Skeleton, useToast } from '@shared/ui';
import { formatUserType } from '@shared/utils';
import type { PermissionModule, UserEffectivePermissions } from '../domain';
import { getEditableModules, toGrantMap } from './permission-tree';
import { buildUserPermissionWrites } from './user-permission-diff';
import { ModuleRailItem, OverrideGranularPane } from './OverridePermissionPanels';
import {
  useReplaceUserDenies,
  useUpdateUserGrants,
  useUserPermissions,
} from './use-permissions';
import managerStyles from './PermissionsManager.module.css';
import styles from './UserPermissionsEditor.module.css';

type Grants = Record<string, boolean>;

/** Modules that actually carry toggleable permissions (consolidated and standardized). */
const editableModules = (data: UserEffectivePermissions): readonly PermissionModule[] =>
  getEditableModules(data.permissionModules);

/** Best-effort role value when reverting an override — the truth shows after Save + refetch. */
const roleGuess = (name: string, data: UserEffectivePermissions): boolean =>
  data.deniedPermissions.includes(name);

interface EditorState {
  readonly grants: Grants;
  readonly resetCaps: ReadonlySet<string>;
  readonly saving: boolean;
  readonly toggle: (module: PermissionModule, name: string, on: boolean) => void;
  readonly resetCap: (name: string) => void;
  readonly resetAll: () => void;
  readonly save: () => void;
}

const useEditorState = (
  data: UserEffectivePermissions,
  userId: string,
  onClose: () => void,
): EditorState => {
  const [grants, setGrants] = useState<Grants>(() => toGrantMap(data.permissionModules));
  const [resetCaps, setResetCaps] = useState<ReadonlySet<string>>(() => new Set());
  const updateGrants = useUpdateUserGrants();
  const replaceDenies = useReplaceUserDenies();
  const toast = useToast();

  const toggle = (module: PermissionModule, name: string, on: boolean): void => {
    setResetCaps((current) => {
      if (!current.has(name)) return current;
      const next = new Set(current);
      next.delete(name);
      return next;
    });
    setGrants((current) => {
      if (name !== module.basePermission) return { ...current, [name]: on };
      const next: Grants = { ...current, [name]: on };
      if (!on) for (const key of Object.keys(module.permissions)) next[key] = false;
      return next;
    });
  };

  const resetCap = (name: string): void => {
    setResetCaps((current) => new Set(current).add(name));
    setGrants((current) => ({ ...current, [name]: roleGuess(name, data) }));
  };

  const resetAll = (): void => {
    const overridden = new Set<string>([
      ...data.directGrantedPermissions,
      ...data.deniedPermissions,
    ]);
    setResetCaps(overridden);
    setGrants(() => {
      const next: Grants = { ...toGrantMap(data.permissionModules) };
      for (const name of overridden) next[name] = roleGuess(name, data);
      return next;
    });
  };

  const save = async (): Promise<void> => {
    const writes = buildUserPermissionWrites(data, grants, resetCaps);
    if (!writes.grantChanged && !writes.deniesChanged) {
      onClose();
      return;
    }
    try {
      if (writes.grantChanged) {
        await updateGrants.mutateAsync({ userId, permissions: writes.grantDiff });
      }
      if (writes.deniesChanged) {
        await replaceDenies.mutateAsync({ userId, deniedPermissions: writes.newDenies });
      }
    } catch {
      // The failure is surfaced by the global mutation error toast; keep the editor open.
      return;
    }
    toast.success('Permissions updated.');
    onClose();
  };

  return {
    grants,
    resetCaps,
    saving: updateGrants.isPending || replaceDenies.isPending,
    toggle,
    resetCap,
    resetAll,
    save: () => {
      void save();
    },
  };
};

const EditorBanner = ({
  data,
}: {
  readonly data: UserEffectivePermissions;
}): ReactElement => {
  const direct = data.directGrantedPermissions.length;
  const denied = data.deniedPermissions.length;
  return (
    <div className={styles.banner}>
      <Info size={15} aria-hidden="true" />
      <span>
        <strong>Role:</strong>{' '}
        {data.userTypeName ? formatUserType(data.userTypeName) : '—'}.{' '}
        {direct === 0 && denied === 0
          ? 'Using role defaults.'
          : `${String(direct)} direct grant${direct === 1 ? '' : 's'} · ${String(denied)} denied.`}
      </span>
    </div>
  );
};

const EditorForm = ({
  data,
  userId,
  onClose,
}: {
  readonly data: UserEffectivePermissions;
  readonly userId: string;
  readonly onClose: () => void;
}): ReactElement => {
  const modules = useMemo(() => editableModules(data), [data]);
  const state = useEditorState(data, userId, onClose);
  const [selectedId, setSelectedId] = useState<string>(() => modules[0]?.moduleId ?? '');
  const selected = modules.find((module) => module.moduleId === selectedId) ?? modules[0];

  return (
    <div className={styles.body}>
      <EditorBanner data={data} />

      <div className={managerStyles.editorBody}>
        <div className={managerStyles.moduleList}>
          <span className={managerStyles.railHead}>Module access (sidebar menu)</span>
          {modules.map((module) => (
            <ModuleRailItem
              key={module.moduleId}
              module={module}
              active={module.moduleId === (selected?.moduleId ?? '')}
              grants={state.grants}
              data={data}
              resetCaps={state.resetCaps}
              onSelect={setSelectedId}
              onToggleBase={(mod, on) => {
                state.toggle(mod, mod.basePermission, on);
              }}
            />
          ))}
        </div>

        {selected !== undefined ? (
          <OverrideGranularPane
            module={selected}
            grants={state.grants}
            data={data}
            resetCaps={state.resetCaps}
            onBase={(mod, on) => {
              state.toggle(mod, mod.basePermission, on);
            }}
            onAction={(name, on) => {
              state.toggle(selected, name, on);
            }}
            onReset={state.resetCap}
          />
        ) : (
          <p className={managerStyles.gridEmpty}>No modules to configure.</p>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="ghost" onClick={state.resetAll}>
          <RotateCcw size={14} aria-hidden="true" /> Reset to role default
        </Button>
        <Button isLoading={state.saving} onClick={state.save}>
          Save changes
        </Button>
      </div>
    </div>
  );
};

const EditorBody = ({
  userId,
  onClose,
}: {
  readonly userId: string;
  readonly onClose: () => void;
}): ReactElement => {
  const query = useUserPermissions(userId);
  if (query.isPending) {
    return (
      <div className={styles.body} aria-hidden="true">
        <Skeleton width="80%" height={40} radius={8} />
        <div className={managerStyles.editorBody}>
          <div className={managerStyles.moduleList}>
            {Array.from({ length: 6 }, (_unused, index) => (
              <div
                key={`skeleton-module-${String(index)}`}
                className={managerStyles.moduleItem}
              >
                <Skeleton width={32} height={18} radius={9} />
                <Skeleton width="70%" height={12} />
              </div>
            ))}
          </div>
          <div className={managerStyles.gridPane}>
            <div className={managerStyles.granGrid}>
              {Array.from({ length: 4 }, (_unused, index) => (
                <div
                  key={`skeleton-gran-${String(index)}`}
                  className={managerStyles.granCard}
                >
                  <Skeleton width={16} height={16} radius={4} />
                  <Skeleton width="80%" height={12} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="error" title="Could not load permissions">
        {query.error.message}
      </Alert>
    );
  }
  return <EditorForm data={query.data} userId={userId} onClose={onClose} />;
};

export interface UserPermissionsEditorProps {
  /** The user being edited (`{ id, name }`), or `null` when the editor is closed. */
  readonly user: { readonly id: string; readonly name: string } | null;
  readonly onClose: () => void;
}

/**
 * Per-user permission editor. Loads the user's effective permission tree and lets an admin grant,
 * revoke, or deny individual capabilities on top of their user-type role, persisting via the real
 * `UserPermissionAppService` (direct grants + explicit denies).
 */
export const UserPermissionsEditor = ({
  user,
  onClose,
}: UserPermissionsEditorProps): ReactElement => (
  <Modal
    open={user !== null}
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
    title={user !== null ? `${user.name}'s permissions` : 'Permissions'}
    description="Fine-tune individual capabilities for this member."
    size="xl"
  >
    {user !== null ? (
      <EditorBody key={user.id} userId={user.id} onClose={onClose} />
    ) : null}
  </Modal>
);
