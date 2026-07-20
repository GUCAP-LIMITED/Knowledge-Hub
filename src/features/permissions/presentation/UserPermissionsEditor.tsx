import { type ReactElement, useMemo, useState } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { Alert, Button, Modal, Spinner, useToast } from '@shared/ui';
import type { PermissionModule, UserEffectivePermissions } from '../domain';
import { flattenModules, toGrantMap } from './permission-tree';
import { buildUserPermissionWrites } from './user-permission-diff';
import { OverridePermissionCard } from './OverridePermissionCard';
import {
  useReplaceUserDenies,
  useUpdateUserGrants,
  useUserPermissions,
} from './use-permissions';
import styles from './UserPermissionsEditor.module.css';

type Grants = Record<string, boolean>;

/** Modules that actually carry toggleable permissions (parents and children, flattened). */
const editableModules = (data: UserEffectivePermissions): readonly PermissionModule[] =>
  flattenModules(data.permissionModules).filter(
    (module) => Object.keys(module.permissions).length > 0,
  );

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
        <strong>Role:</strong> {data.userTypeName ?? '—'}.{' '}
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

  return (
    <div className={styles.body}>
      <EditorBanner data={data} />
      <span className={styles.sectionLabel}>Individual permission overrides</span>
      <div className={styles.moduleGrid}>
        {modules.map((module) => (
          <OverridePermissionCard
            key={module.moduleId}
            module={module}
            grants={state.grants}
            data={data}
            resetCaps={state.resetCaps}
            onToggle={state.toggle}
            onReset={state.resetCap}
          />
        ))}
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
      <div className={styles.center}>
        <Spinner size="lg" label="Loading permissions" />
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
    size="lg"
  >
    {user !== null ? (
      <EditorBody key={user.id} userId={user.id} onClose={onClose} />
    ) : null}
  </Modal>
);
