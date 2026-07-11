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
  onOpen,
}: {
  readonly user: UserAccount;
  readonly onOpen: (user: UserAccount) => void;
}): ReactElement => {
  const active = user.isActive();
  return (
    <tr className={styles.tr}>
      <td className={styles.cell} data-label="User">
        <div className={styles.person}>
          <Avatar name={user.name} size={32} online={active} />
          <div className={styles.identity}>
            <span className={styles.name}>{user.name}</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        </div>
      </td>
      <td className={styles.cell} data-label="Role">
        <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
      </td>
      <td className={styles.cell} data-label="Status">
        <Badge tone={active ? 'success' : 'neutral'}>
          {active ? 'active' : 'inactive'}
        </Badge>
      </td>
      <td className={styles.cellMuted} data-label="Joined">
        {user.joined}
      </td>
      <td className={styles.cellSubtle} data-label="Last active">
        {user.lastActive}
      </td>
      <td className={styles.cell} data-label="">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            onOpen(user);
          }}
        >
          Manage
        </Button>
      </td>
    </tr>
  );
};

export interface UsersTableProps {
  readonly users: readonly UserAccount[];
  readonly onOpen: (user: UserAccount) => void;
}

/** Directory table of every platform user; "Manage" opens the member details drawer. */
export const UsersTable = ({ users, onOpen }: UsersTableProps): ReactElement => (
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
          <UserRow key={user.id} user={user} onOpen={onOpen} />
        ))}
      </tbody>
    </table>
  </div>
);
