import type { ReactElement } from 'react';
import { Avatar, Badge, Button, StatusBadge } from '@shared/ui';
import type { BranchUser } from '../domain';
import { userDisplayName as displayName } from './user-display-name';
import styles from './UserDirectory.module.css';

const HEADERS: readonly string[] = ['User', 'User types', 'Branches', 'Status', ''];

const UserDirectoryRow = ({
  user,
  onManage,
}: {
  readonly user: BranchUser;
  readonly onManage: (user: BranchUser) => void;
}): ReactElement => (
  <tr className={styles.tr}>
    <td className={styles.cell} data-label="User">
      <div className={styles.person}>
        <Avatar name={displayName(user)} size={32} online={user.isActive} />
        <div className={styles.identity}>
          <span className={styles.name}>{displayName(user)}</span>
          {user.email !== null ? (
            <span className={styles.email}>{user.email}</span>
          ) : null}
        </div>
      </div>
    </td>
    <td className={styles.cell} data-label="User types">
      <div className={styles.badges}>
        {user.userTypes.length === 0 ? (
          <span className={styles.muted}>—</span>
        ) : (
          user.userTypes.map((t) => (
            <Badge key={t.id} tone="info" size="sm">
              {t.name}
            </Badge>
          ))
        )}
      </div>
    </td>
    <td className={styles.cell} data-label="Branches">
      <div className={styles.badges}>
        {user.branches.length === 0 ? (
          <span className={styles.muted}>—</span>
        ) : (
          user.branches.map((b) => (
            <Badge key={b.branchId} tone={b.isPrimary ? 'primary' : 'neutral'} size="sm">
              {b.branchName}
            </Badge>
          ))
        )}
      </div>
    </td>
    <td className={styles.cell} data-label="Status">
      <StatusBadge
        tone={user.isActive ? 'success' : 'danger'}
        label={user.isActive ? 'Active' : 'Blocked'}
      />
    </td>
    <td className={styles.cell} data-label="">
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            onManage(user);
          }}
        >
          Manage
        </Button>
      </div>
    </td>
  </tr>
);

export interface UserDirectoryTableProps {
  readonly users: readonly BranchUser[];
  readonly onManage: (user: BranchUser) => void;
}

/** Directory table: identity, user types, branches, status, and a "Manage" entry point per user. */
export const UserDirectoryTable = ({
  users,
  onManage,
}: UserDirectoryTableProps): ReactElement => (
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
          <UserDirectoryRow key={user.userId} user={user} onManage={onManage} />
        ))}
      </tbody>
    </table>
  </div>
);
