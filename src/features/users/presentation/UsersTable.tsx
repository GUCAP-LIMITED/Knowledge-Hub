import type { ReactElement } from 'react';
import { Avatar, Badge, Button, type BadgeTone } from '@shared/ui';
import type { UserAccount, UserRole } from '../domain';
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

const HEADERS: readonly string[] = [
  'User',
  'Role',
  'Status',
  'Joined',
  'Last Active',
  '',
];

const UserRow = ({
  user,
  isBusy,
  onToggle,
}: {
  readonly user: UserAccount;
  readonly isBusy: boolean;
  readonly onToggle: (user: UserAccount) => void;
}): ReactElement => {
  const active = user.isActive();
  return (
    <tr className={styles.tr}>
      <td className={styles.cell}>
        <div className={styles.person}>
          <Avatar name={user.name} size={32} online={active} />
          <div className={styles.identity}>
            <span className={styles.name}>{user.name}</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        </div>
      </td>
      <td className={styles.cell}>
        <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
      </td>
      <td className={styles.cell}>
        <Badge tone={active ? 'success' : 'neutral'}>
          {active ? 'active' : 'inactive'}
        </Badge>
      </td>
      <td className={styles.cellMuted}>{user.joined}</td>
      <td className={styles.cellSubtle}>{user.lastActive}</td>
      <td className={styles.cell}>
        <Button
          size="sm"
          variant="secondary"
          isLoading={isBusy}
          onClick={() => {
            onToggle(user);
          }}
        >
          {active ? 'Deactivate' : 'Activate'}
        </Button>
      </td>
    </tr>
  );
};

export interface UsersTableProps {
  readonly users: readonly UserAccount[];
  readonly busyId: string | null;
  readonly onToggle: (user: UserAccount) => void;
}

/** Directory table of every platform user with an activate/deactivate action. */
export const UsersTable = ({
  users,
  busyId,
  onToggle,
}: UsersTableProps): ReactElement => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          {HEADERS.map((header, index) => (
            <th
              key={header === '' ? `col-${String(index)}` : header}
              className={styles.th}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isBusy={busyId === user.id}
            onToggle={onToggle}
          />
        ))}
      </tbody>
    </table>
  </div>
);
