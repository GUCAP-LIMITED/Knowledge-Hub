import type { ReactElement } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { Button, Modal } from '@shared/ui';
import { cn } from '@shared/utils';
import type { UserAccount, UserRole } from '../domain';
import { MODULES } from './permission-catalog';
import {
  ROLE_DEFAULT_SET,
  baseSetFor,
  emptyUserPermission,
  findSet,
  isCustomised,
} from './permission-sets';
import { usePermissionSets } from './use-permission-sets';
import { OverrideModuleCard } from './OverrideModuleCard';
import styles from './EditPermissions.module.css';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  consultant: 'Consultant',
};

export interface EditPermissionsModalProps {
  readonly user: UserAccount | null;
  readonly onClose: () => void;
}

const AssignmentRow = ({
  role,
  assignedSetId,
  onAssign,
}: {
  readonly role: UserRole;
  readonly assignedSetId: string | null;
  readonly onAssign: (setId: string | null) => void;
}): ReactElement => {
  const sets = usePermissionSets((s) => s.sets);
  const roleDefaultId = ROLE_DEFAULT_SET[role];
  return (
    <div className={styles.assignRow}>
      <button
        type="button"
        className={cn(styles.assignBtn, assignedSetId === null && styles.assignActive)}
        onClick={() => {
          onAssign(null);
        }}
      >
        <RotateCcw size={13} aria-hidden="true" /> Use role default
      </button>
      {sets.map((set) => (
        <button
          key={set.id}
          type="button"
          className={cn(
            styles.assignBtn,
            assignedSetId === set.id && styles.assignActive,
          )}
          onClick={() => {
            onAssign(set.id);
          }}
        >
          {set.name}
          {set.id === roleDefaultId ? (
            <span className={styles.assignTag}>Role default</span>
          ) : null}
        </button>
      ))}
    </div>
  );
};

const Body = ({ user }: { readonly user: UserAccount }): ReactElement => {
  const store = usePermissionSets();
  const sets = usePermissionSets((s) => s.sets);
  const permission = store.userPerms[user.id] ?? emptyUserPermission();
  const base = baseSetFor(sets, user.role, permission.setId);
  const roleDefault = findSet(sets, ROLE_DEFAULT_SET[user.role]);
  const customised = isCustomised(permission);

  return (
    <div className={styles.body}>
      <div className={styles.banner}>
        <Info size={15} aria-hidden="true" />
        <span>
          <strong>Role default:</strong> {ROLE_LABEL[user.role]} →{' '}
          {roleDefault?.name ?? '—'}.{' '}
          {customised ? 'This user has a custom override.' : 'Using role default.'}
        </span>
      </div>

      <span className={styles.sectionLabel}>Permission set assignment</span>
      <AssignmentRow
        role={user.role}
        assignedSetId={permission.setId}
        onAssign={(setId) => {
          store.assignUserSet(user.id, setId);
        }}
      />

      <span className={styles.sectionLabel}>Individual permission overrides</span>
      <div className={styles.moduleGrid}>
        {MODULES.map((module) => (
          <OverrideModuleCard
            key={module.id}
            module={module}
            base={base}
            overrides={permission.overrides}
            onToggle={(cap) => {
              store.toggleUserCap(user.id, user.role, module.id, cap);
            }}
            onReset={(cap) => {
              store.resetUserCap(user.id, user.role, module.id, cap);
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** Per-user permission editor: pick an access set, then fine-tune individual capabilities. */
export const EditPermissionsModal = ({
  user,
  onClose,
}: EditPermissionsModalProps): ReactElement => {
  const resetUserAll = usePermissionSets((s) => s.resetUserAll);
  return (
    <Modal
      open={user !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title={user !== null ? `${user.name}'s permissions` : 'Permissions'}
      description="Assign an access set or fine-tune individual capabilities for this member."
      size="lg"
      footer={
        user !== null ? (
          <div className={styles.footer}>
            <Button
              variant="ghost"
              onClick={() => {
                resetUserAll(user.id);
              }}
            >
              <RotateCcw size={14} aria-hidden="true" /> Reset to role default
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        ) : null
      }
    >
      {user !== null ? <Body key={user.id} user={user} /> : null}
    </Modal>
  );
};
