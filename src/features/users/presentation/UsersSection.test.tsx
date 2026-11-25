import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { BranchUser } from '../domain';
import { UsersSection } from './UsersSection';

const mockUsers: readonly BranchUser[] = [
  {
    userId: 'u-1',
    userName: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true,
    userTypes: [{ id: 'ut-1', name: 'Admin' }],
    branches: [{ branchId: 'b-1', branchName: 'London Office', isPrimary: true }],
    profileImageUrl: null,
  },
];

vi.mock('./use-user-directory', () => ({
  useBranches: () => ({ data: [{ id: 'b-1', name: 'London Office' }] }),
  useBranchUsers: () => ({
    isLoading: false,
    isError: false,
    data: mockUsers,
  }),
  useBlockUser: () => ({ isPending: false, mutate: vi.fn() }),
  useUnblockUser: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock('@features/user-types', () => ({
  useSelectableUserTypes: () => ({
    data: [{ id: 'ut-1', name: 'Admin' }],
  }),
}));

let mockCanManageUsers = true;

vi.mock('@features/permissions', () => ({
  useMyPermissions: () => ({
    data: { 'Branches.ManageUsers': mockCanManageUsers },
  }),
  hasPermissionGrant: (
    permissions: Record<string, boolean> | undefined,
    key: string,
  ): boolean => permissions?.[key] === true,
  UserPermissionsEditor: () => null,
}));

vi.mock('./MemberDetailsModal', () => ({
  MemberDetailsModal: () => null,
}));

describe('<UsersSection />', () => {
  beforeEach(() => {
    mockCanManageUsers = true;
  });

  it('renders Access Denied when the user lacks Branches.ManageUsers permission', () => {
    mockCanManageUsers = false;

    render(
      <MemoryRouter initialEntries={['/settings/users']}>
        <Routes>
          <Route path="/settings/users" element={<UsersSection />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText('You do not have permission to view the user directory.'),
    ).toBeInTheDocument();
  });
  it('renders "Manage User Types" as a link pointing to /settings/users/user-types', () => {
    render(
      <MemoryRouter initialEntries={['/settings/users']}>
        <Routes>
          <Route path="/settings/users" element={<UsersSection />} />
        </Routes>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /manage user types/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings/users/user-types');
  });

  it('navigates to /settings/users/user-types when "Manage User Types" is clicked without opening a modal', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/settings/users']}>
        <Routes>
          <Route path="/settings/users" element={<UsersSection />} />
          <Route
            path="/settings/users/user-types"
            element={<div data-testid="user-types-destination">User Types Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /manage user types/i });
    await user.click(link);

    expect(screen.getByTestId('user-types-destination')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
