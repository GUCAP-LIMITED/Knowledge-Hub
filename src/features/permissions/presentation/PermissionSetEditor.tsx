import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Save, Shield } from 'lucide-react';
import { Alert, Button, useToast } from '@shared/ui';
import type { PermissionModule, PermissionSetDetail } from '../domain';
import { getEditableModules, hasPermissionChanges, toGrantMap } from './permission-tree';
import { GranularPane, ModuleRail, type Grants } from './PermissionSetPanels';
import { useUpdatePermissionSet } from './use-permissions';
import styles from './PermissionsManager.module.css';

const editableModules = (detail: PermissionSetDetail): readonly PermissionModule[] =>
  getEditableModules(detail.permissionModules);

interface EditorHeadProps {
  readonly name: string;
  readonly description: string | null;
  readonly enabled: number;
  readonly saving: boolean;
  readonly canSave: boolean;
  readonly onSave: () => void;
}

const EditorHead = ({
  name,
  description,
  enabled,
  saving,
  canSave,
  onSave,
}: EditorHeadProps): ReactElement => (
  <div className={styles.editorHead}>
    <span className={styles.editorIcon}>
      <Shield size={18} aria-hidden />
    </span>
    <div className={styles.editorTitleWrap}>
      <h3 className={styles.editorTitle}>{name}</h3>
      <p className={styles.editorDesc}>
        {description !== null ? `${description} · ` : ''}
        {enabled} permissions enabled
      </p>
    </div>
    <Button size="sm" onClick={onSave} isLoading={saving} disabled={!canSave}>
      <Save size={14} aria-hidden /> Save changes
    </Button>
  </div>
);

interface PermissionSetGrantsState {
  readonly grants: Grants;
  readonly setGrants: React.Dispatch<React.SetStateAction<Grants>>;
  readonly hasChanges: boolean;
  readonly setBase: (module: PermissionModule, on: boolean) => void;
  readonly setAction: (name: string, on: boolean) => void;
}

function usePermissionSetGrants(
  permissionModules: readonly PermissionModule[],
): PermissionSetGrantsState {
  const initialGrants = useMemo(() => toGrantMap(permissionModules), [permissionModules]);
  const [grants, setGrants] = useState<Grants>(() => initialGrants);

  useEffect(() => {
    setGrants(toGrantMap(permissionModules));
  }, [permissionModules]);

  const hasChanges = useMemo(
    () => hasPermissionChanges(initialGrants, grants),
    [initialGrants, grants],
  );

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

  return { grants, setGrants, hasChanges, setBase, setAction };
}

/** Two-pane editor for one permission set: module rail (left) + granular grid (right). */
export const PermissionSetEditor = ({
  detail,
}: {
  readonly detail: PermissionSetDetail;
}): ReactElement => {
  const toast = useToast();
  const updateSet = useUpdatePermissionSet();
  const modules = useMemo(() => editableModules(detail), [detail]);
  const { grants, setGrants, hasChanges, setBase, setAction } = usePermissionSetGrants(
    detail.permissionModules,
  );

  const [selectedId, setSelectedId] = useState<string>(() => modules[0]?.moduleId ?? '');
  const selected = modules.find((module) => module.moduleId === selectedId) ?? modules[0];
  const enabled = Object.keys(grants).filter((key) => grants[key]).length;

  const onSave = (): void => {
    updateSet.mutate(
      {
        id: detail.id,
        input: {
          name: detail.name,
          description: detail.description,
          color: detail.color,
          bgColor: detail.bgColor,
          permissions: grants,
        },
      },
      {
        onSuccess: (savedDetail) => {
          setGrants(toGrantMap(savedDetail.permissionModules));
          toast.success('Permissions updated.');
        },
      },
    );
  };

  return (
    <div className={styles.editor}>
      <EditorHead
        name={detail.name}
        description={detail.description}
        enabled={enabled}
        saving={updateSet.isPending}
        canSave={hasChanges && !updateSet.isPending}
        onSave={onSave}
      />

      {updateSet.isError ? (
        <Alert tone="error" title="Could not save">
          {updateSet.error.message}
        </Alert>
      ) : null}

      <div className={styles.editorBody}>
        <ModuleRail
          modules={modules}
          selectedId={selected?.moduleId ?? ''}
          grants={grants}
          onSelect={setSelectedId}
          onToggleBase={setBase}
        />

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
