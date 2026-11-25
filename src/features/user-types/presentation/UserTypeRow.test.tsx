import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildUserType } from '@testing/builders/user-type.builder';
import { UserTypeRow } from './UserTypeRow';

let canDelete = false;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (module: string, cap: string) =>
      module === 'user-types' && cap === 'delete' && canDelete,
  }),
}));

describe('<UserTypeRow /> permission gating', () => {
  beforeEach(() => {
    canDelete = false;
  });

  it('hides delete without user-types.delete', () => {
    render(<UserTypeRow item={buildUserType({ name: 'Manager' })} onDelete={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: /delete manager/i }),
    ).not.toBeInTheDocument();
  });

  it('shows delete with user-types.delete', () => {
    canDelete = true;
    render(<UserTypeRow item={buildUserType({ name: 'Manager' })} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /delete manager/i })).toBeInTheDocument();
  });
});
