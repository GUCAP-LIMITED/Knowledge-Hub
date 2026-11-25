import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BulkActionBar } from './BulkActionBar';

let canApprove = false;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (module: string, cap: string) =>
      module === 'approvals' && cap === 'approve' && canApprove,
  }),
}));

describe('<BulkActionBar /> permission gating', () => {
  beforeEach(() => {
    canApprove = false;
  });

  it('hides "Approve selected" without approvals.approve', () => {
    render(
      <BulkActionBar count={2} busy={false} onApprove={vi.fn()} onClear={vi.fn()} />,
    );

    expect(
      screen.queryByRole('button', { name: /approve selected/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('shows "Approve selected" with approvals.approve', () => {
    canApprove = true;
    render(
      <BulkActionBar count={2} busy={false} onApprove={vi.fn()} onClear={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: /approve selected/i })).toBeInTheDocument();
  });
});
