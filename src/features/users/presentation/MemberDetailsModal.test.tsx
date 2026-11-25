import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { BranchUser } from '../domain';
import { MemberDetailsModal } from './MemberDetailsModal';

let grants: readonly string[] = [];

vi.mock('./use-my-capabilities', () => ({
  useMyCapabilities: () => ({
    isLoading: false,
    can: (module: string, cap: string) => grants.includes(`${module}.${cap}`),
  }),
}));

const user: BranchUser = {
  userId: 'u-1',
  userName: 'alice',
  name: 'Alice',
  email: 'alice@example.com',
  isActive: true,
  userTypes: [],
  branches: [],
  profileImageUrl: null,
};

const renderModal = (): void => {
  render(
    <MemberDetailsModal
      user={user}
      isBusy={false}
      onClose={vi.fn()}
      onEditPermissions={vi.fn()}
      onToggleStatus={vi.fn()}
    />,
  );
};

describe('<MemberDetailsModal /> permission gating', () => {
  beforeEach(() => {
    grants = [];
  });

  it('hides block and edit-permissions actions without grants', () => {
    renderModal();

    expect(
      screen.queryByRole('button', { name: /block account/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /edit permissions/i }),
    ).not.toBeInTheDocument();
  });

  it('shows block action only with users.deactivate', () => {
    grants = ['users.deactivate'];
    renderModal();

    expect(screen.getByRole('button', { name: /block account/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /edit permissions/i }),
    ).not.toBeInTheDocument();
  });

  it('shows edit-permissions only with users.changePermissions', () => {
    grants = ['users.changePermissions'];
    renderModal();

    expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /block account/i }),
    ).not.toBeInTheDocument();
  });
});
