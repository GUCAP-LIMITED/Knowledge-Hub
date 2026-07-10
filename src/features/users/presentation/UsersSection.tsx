import { useMemo, type ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import type { UserAccount } from '../domain';
import { useSetUserStatus, useUsers } from './use-users';
import { UsersTable } from './UsersTable';
import styles from './AdminSettingsPage.module.css';

/** Users directory panel: load state, error state, and the activate/suspend table. */
export const UsersSection = (): ReactElement => {
  const users = useUsers();
  const setStatus = useSetUserStatus();
  const accounts = useMemo(() => users.data ?? [], [users.data]);
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
  return <UsersTable users={accounts} busyId={busyId} onToggle={toggle} />;
};
