import { useState, type ReactElement } from 'react';
import { Check, ChevronLeft, Search } from 'lucide-react';
import { useDebouncedValue } from '@shared/utils';
import type { AssignableUser } from '../domain';
import { useAssignableUsers } from './use-assignments';
import styles from './AssigneeSelect.module.css';

const getUserDisplayName = (user: AssignableUser): string => {
  const full = `${user.name} ${user.surname}`.trim();
  return full.length > 0 ? full : user.userName;
};

const getUserInitials = (displayName: string): string => {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 0 || parts[0]?.length === 0) return '?';
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? '?';
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
};

interface UserSearchResultsProps {
  readonly users: readonly AssignableUser[] | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly selectedTargetId: string;
  readonly disabledTargetIds?: ReadonlySet<string> | undefined;
  readonly onPickUser: (user: AssignableUser) => void;
}

const UserSearchResults = ({
  users,
  isLoading,
  isError,
  selectedTargetId,
  disabledTargetIds,
  onPickUser,
}: UserSearchResultsProps): ReactElement => {
  if (isLoading) {
    return <div className={styles.itemEmpty}>Loading users…</div>;
  }
  if (isError) {
    return <div className={styles.itemEmpty}>Failed to load users</div>;
  }
  if (!users || users.length === 0) {
    return <div className={styles.itemEmpty}>No users found</div>;
  }

  return (
    <>
      {users.map((user) => {
        const displayName = getUserDisplayName(user);
        const initials = getUserInitials(displayName);
        const isSelected = user.id === selectedTargetId;
        const isDisabled = disabledTargetIds?.has(user.id) ?? false;

        return (
          <button
            key={user.id}
            type="button"
            className={styles.userItem}
            disabled={isDisabled}
            title={isDisabled ? 'Already assigned' : undefined}
            onClick={() => {
              if (!isDisabled) {
                onPickUser(user);
              }
            }}
          >
            <div className={styles.userAvatar} aria-hidden="true">
              {initials}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              {user.email.length > 0 ? (
                <span className={styles.userEmail}>{user.email}</span>
              ) : null}
            </div>
            <span className={styles.check}>
              {isSelected ? <Check size={14} aria-hidden="true" /> : null}
            </span>
          </button>
        );
      })}
    </>
  );
};

export interface UserSearchMenuProps {
  readonly selectedTargetId: string;
  readonly disabledTargetIds?: ReadonlySet<string> | undefined;
  readonly onBack: () => void;
  readonly onPickUser: (user: AssignableUser) => void;
}

export const UserSearchMenu = ({
  selectedTargetId,
  disabledTargetIds,
  onBack,
  onPickUser,
}: UserSearchMenuProps): ReactElement => {
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebouncedValue(filter);
  const { data: users, isLoading, isError } = useAssignableUsers(debouncedFilter);

  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack}>
          <ChevronLeft size={14} aria-hidden="true" />
          <span>
            Categories · <span className={styles.headerCategory}>User</span>
          </span>
        </button>
      </div>
      <div className={styles.searchRow}>
        <Search size={14} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          autoFocus
          className={styles.searchInput}
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
          }}
          placeholder="Search by name, email…"
          aria-label="Search users"
        />
      </div>
      <UserSearchResults
        users={users}
        isLoading={isLoading}
        isError={isError}
        selectedTargetId={selectedTargetId}
        disabledTargetIds={disabledTargetIds}
        onPickUser={onPickUser}
      />
    </div>
  );
};
