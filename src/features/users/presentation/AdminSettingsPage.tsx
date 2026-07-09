import { useMemo, type ReactElement } from 'react';
import { UserCheck, Users as UsersIcon } from 'lucide-react';
import {
  Alert,
  Avatar,
  Badge,
  type BadgeTone,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
} from '@shared/ui';
import type { UserAccount, UserRole } from '../domain';
import { useUsers } from './use-users';
import styles from './AdminSettingsPage.module.css';

const ROLE_TONE: Record<UserRole, BadgeTone> = {
  admin: 'danger',
  manager: 'info',
  consultant: 'primary',
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  consultant: 'Consultant',
};

const UserRow = ({ user }: { readonly user: UserAccount }): ReactElement => {
  const active = user.isActive();
  return (
    <li className={styles.row}>
      <div className={styles.person}>
        <Avatar name={user.name} online={active} />
        <div className={styles.identity}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.email}>{user.email}</span>
        </div>
      </div>
      <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
      <Badge tone={active ? 'success' : 'neutral'}>
        {active ? 'Active' : 'Inactive'}
      </Badge>
      <span className={styles.meta}>{user.joined}</span>
      <span className={styles.meta}>{user.lastActive}</span>
    </li>
  );
};

/** Routed admin Settings page: platform user directory with role and status. */
export const AdminSettingsPage = (): ReactElement => {
  const users = useUsers();
  const accounts = useMemo(() => users.data ?? [], [users.data]);
  const activeCount = useMemo(
    () => accounts.filter((account) => account.isActive()).length,
    [accounts],
  );

  return (
    <section className={styles.screen}>
      <PageHeader title="Settings" subtitle="Manage platform users and access" />

      {users.isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading users" />
        </div>
      ) : null}

      {users.isError ? (
        <Alert tone="error" title="Could not load users">
          {users.error.message}
        </Alert>
      ) : null}

      {!users.isLoading && !users.isError ? (
        <>
          <div className={styles.stats}>
            <StatCard
              label="Total users"
              value={accounts.length}
              icon={UsersIcon}
              tone="primary"
            />
            <StatCard
              label="Active"
              value={activeCount}
              icon={UserCheck}
              tone="success"
            />
          </div>

          {accounts.length === 0 ? (
            <EmptyState
              title="No users yet"
              description="Invite colleagues to manage their access here."
            />
          ) : (
            <ul className={styles.list}>
              {accounts.map((account) => (
                <UserRow key={account.id} user={account} />
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  );
};
