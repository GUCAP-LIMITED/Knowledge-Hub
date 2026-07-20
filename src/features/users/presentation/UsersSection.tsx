import { type ReactElement, useMemo, useState } from 'react';
import { Alert, EmptyState, FilterBar, Select, Spinner, TextField } from '@shared/ui';
import { UserPermissionsEditor } from '@features/permissions';
import type { BranchListItem, BranchUser } from '../domain';
import {
  useBlockUser,
  useBranchUsers,
  useBranches,
  useUnblockUser,
} from './use-user-directory';
import { userDisplayName } from './user-display-name';
import { UserDirectoryTable } from './UserDirectoryTable';
import { MemberDetailsDrawer } from './MemberDetailsDrawer';
import styles from './UserDirectory.module.css';

type EditingUser = { readonly id: string; readonly name: string } | null;

const matchesSearch = (user: BranchUser, needle: string): boolean => {
  if (needle === '') {
    return true;
  }
  return [user.name, user.userName, user.email].some(
    (value) => value?.toLowerCase().includes(needle) === true,
  );
};

const UsersToolbar = ({
  branchId,
  branches,
  search,
  count,
  onBranch,
  onSearch,
}: {
  readonly branchId: string | null;
  readonly branches: readonly BranchListItem[];
  readonly search: string;
  readonly count: number;
  readonly onBranch: (branchId: string | null) => void;
  readonly onSearch: (value: string) => void;
}): ReactElement => (
  <FilterBar
    search={
      <TextField
        label="Search"
        placeholder="Search name or email…"
        value={search}
        onChange={(event) => {
          onSearch(event.target.value);
        }}
      />
    }
    controls={
      <Select
        label="Branch"
        value={branchId ?? 'all'}
        onChange={(event) => {
          onBranch(event.target.value === 'all' ? null : event.target.value);
        }}
      >
        <option value="all">All branches</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </Select>
    }
    trailing={
      <span className={styles.count}>
        {count} user{count === 1 ? '' : 's'}
      </span>
    }
  />
);

const UsersResult = ({
  query,
  users,
  onManage,
}: {
  readonly query: ReturnType<typeof useBranchUsers>;
  readonly users: readonly BranchUser[];
  readonly onManage: (user: BranchUser) => void;
}): ReactElement => {
  if (query.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading users" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="error" title="Could not load users">
        {query.error.message}
      </Alert>
    );
  }
  if (users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="No users match the current branch and search filters."
      />
    );
  }
  return <UserDirectoryTable users={users} onManage={onManage} />;
};

/** Users directory: branch filter + search, with a Manage drawer → permission editor per user. */
export const UsersSection = (): ReactElement => {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [managingId, setManagingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingUser>(null);
  const branches = useBranches();
  const users = useBranchUsers(branchId);
  const block = useBlockUser();
  const unblock = useUnblockUser();

  const filtered = useMemo(
    () =>
      (users.data ?? []).filter((user) =>
        matchesSearch(user, search.trim().toLowerCase()),
      ),
    [users.data, search],
  );
  const managingUser =
    managingId !== null
      ? ((users.data ?? []).find((u) => u.userId === managingId) ?? null)
      : null;

  const toggleStatus = (user: BranchUser): void => {
    if (user.isActive) block.mutate(user.userId);
    else unblock.mutate(user.userId);
  };

  return (
    <div className={styles.wrap}>
      <UsersToolbar
        branchId={branchId}
        branches={branches.data ?? []}
        search={search}
        count={filtered.length}
        onBranch={setBranchId}
        onSearch={setSearch}
      />
      <UsersResult
        query={users}
        users={filtered}
        onManage={(user) => {
          setManagingId(user.userId);
        }}
      />
      <MemberDetailsDrawer
        user={managingUser}
        isBusy={block.isPending || unblock.isPending}
        onClose={() => {
          setManagingId(null);
        }}
        onEditPermissions={(user) => {
          setEditing({ id: user.userId, name: userDisplayName(user) });
          setManagingId(null);
        }}
        onToggleStatus={toggleStatus}
      />
      <UserPermissionsEditor
        user={editing}
        onClose={() => {
          setEditing(null);
        }}
      />
    </div>
  );
};
