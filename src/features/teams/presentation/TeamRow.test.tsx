import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Team } from '../domain';
import { TeamRow } from './TeamRow';

let canManage = false;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (module: string, cap: string) =>
      module === 'team' && cap === 'manage' && canManage,
  }),
}));

const team: Team = {
  id: 't-1',
  name: 'Design',
  description: null,
  isActive: true,
  members: [],
};

describe('<TeamRow /> permission gating', () => {
  beforeEach(() => {
    canManage = false;
  });

  it('hides edit and delete without team.manage', () => {
    render(<TeamRow team={team} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: /edit design/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /delete design/i }),
    ).not.toBeInTheDocument();
  });

  it('shows edit and delete with team.manage', () => {
    canManage = true;
    render(<TeamRow team={team} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /edit design/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete design/i })).toBeInTheDocument();
  });
});
