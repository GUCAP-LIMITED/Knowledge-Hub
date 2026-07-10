import { useMemo, useState, type ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import type { UserAccount } from '../domain';
import { useSetUserStatus, useUsers } from './use-users';
import { UsersTable } from './UsersTable';
import { MemberDetailsDrawer } from './MemberDetailsDrawer';
import { EditPermissionsModal } from './EditPermissionsModal';
import styles from './AdminSettingsPage.module.css';

/** Users directory panel: the table plus the member drawer and per-user permission editor. */
export const UsersSection = (): ReactElement => {
  const users = useUsers();
  const setStatus = useSetUserStatus();
  const accounts = useMemo(() => users.data ?? [], [users.data]);
  const [selected, setSelected] = useState<UserAccount | null>(null);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const busyId = setStatus.isPending ? setStatus.variables.id : null;

  const toggle = (user: UserAccount): void => {
    setStatus.mutate({ id: user.id, status: user.isActive() ? 'inactive' : 'active' });
  };

  if (users.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading users" />
      </div>
    );
  }
  if (users.isError) {
    return (
      <Alert tone="error" title="Could not load users">
        {users.error.message}
      </Alert>
    );
  }
  return (
    <>
      <UsersTable users={accounts} onOpen={setSelected} />
      <MemberDetailsDrawer
        user={selected}
        isBusy={selected !== null && busyId === selected.id}
        onClose={() => {
          setSelected(null);
        }}
        onEditPermissions={setEditing}
        onToggleStatus={toggle}
      />
      <EditPermissionsModal
        user={editing}
        onClose={() => {
          setEditing(null);
        }}
      />
    </>
  );
};
