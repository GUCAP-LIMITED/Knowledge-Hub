import { type ReactElement, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  EmptyState,
  FilterBar,
  Select,
  TableSkeleton,
  TextField,
} from '@shared/ui';
import { formatUserType } from '@shared/utils';
import {
  hasPermissionGrant,
  useMyPermissions,
  UserPermissionsEditor,
} from '@features/permissions';
import { useSelectableUserTypes, type SelectableUserType } from '@features/user-types';
import type { BranchListItem, BranchUser } from '../domain';
import {
  useBlockUser,
  useBranchUsers,
  useBranches,
  useUnblockUser,
} from './use-user-directory';
import { userDisplayName } from './user-display-name';
import { UserDirectoryTable } from './UserDirectoryTable';
import { MemberDetailsModal } from './MemberDetailsModal';
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
  userTypeId,
  userTypes,
  search,
  onBranch,
  onUserType,
  onSearch,
}: {
  readonly branchId: string | null;
  readonly branches: readonly BranchListItem[];
  readonly userTypeId: string | null;
  readonly userTypes: readonly SelectableUserType[];
  readonly search: string;
  readonly onBranch: (branchId: string | null) => void;
  readonly onUserType: (userTypeId: string | null) => void;
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
        onClear={() => {
          onSearch('');
        }}
      />
    }
    controls={
      <div className={styles.filterGroup}>
        <Select
          label="Branch"
          value={branchId ?? 'all'}
          onChange={(value) => {
            onBranch(value === 'all' ? null : value);
          }}
          options={[
            { value: 'all', label: 'All branches' },
            ...branches.map((branch) => ({ value: branch.id, label: branch.name })),
          ]}
        />
        <Select
          label="User Type"
          value={userTypeId ?? 'all'}
          onChange={(value) => {
            onUserType(value === 'all' ? null : value);
          }}
          options={[
            { value: 'all', label: 'All user types' },
            ...userTypes.map((type) => ({
              value: type.id,
              label: formatUserType(type.name),
            })),
          ]}
        />
      </div>
    }
    trailing={
      <Button asChild variant="default">
        <Link to="/settings/users/user-types">Manage User Types</Link>
      </Button>
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
    return <TableSkeleton columns={5} />;
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
        description="No users match the current branch, user type, and search filters."
      />
    );
  }
  return <UserDirectoryTable users={users} onManage={onManage} />;
};

/** Users directory: branch & user-type filters + search, with a Manage modal → permission editor per user. */
export const UsersSection = (): ReactElement => {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [userTypeId, setUserTypeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [managingId, setManagingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingUser>(null);
  const branches = useBranches();
  const userTypes = useSelectableUserTypes(false);
  const { data: permissions } = useMyPermissions();
  const canManageUsers = hasPermissionGrant(permissions, 'Branches.ManageUsers');
  const users = useBranchUsers(branchId, userTypeId, canManageUsers);
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

  if (!canManageUsers) {
    return (
      <Alert tone="error" title="Access Denied">
        You do not have permission to view the user directory.
      </Alert>
    );
  }

  const toggleStatus = (user: BranchUser): void => {
    if (user.isActive) block.mutate(user.userId);
    else unblock.mutate(user.userId);
  };

  return (
    <div className={styles.wrap}>
      <UsersToolbar
        branchId={branchId}
        branches={branches.data ?? []}
        userTypeId={userTypeId}
        userTypes={userTypes.data ?? []}
        search={search}
        onBranch={setBranchId}
        onUserType={setUserTypeId}
        onSearch={setSearch}
      />
      <UsersResult
        query={users}
        users={filtered}
        onManage={(user) => {
          setManagingId(user.userId);
        }}
      />
      <span className={styles.count}>
        {filtered.length} user{filtered.length === 1 ? '' : 's'}
      </span>
      <MemberDetailsModal
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
