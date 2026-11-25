import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CertRolePills, type FilterSelection } from './CertRolePills';

const mockRoles = [
  {
    userTypeId: 'role-1',
    roleName: 'Consultant',
    certificateCount: 5,
  },
  {
    userTypeId: 'role-2',
    roleName: 'Sales Lead',
    certificateCount: 3,
  },
];

describe('<CertRolePills />', () => {
  it('renders All, For Me, and role pills with counts', () => {
    const handleSelect = vi.fn();
    render(
      <CertRolePills
        selection={{ type: 'all' }}
        allCount={8}
        myCount={2}
        roles={mockRoles}
        showAll={true}
        onSelect={handleSelect}
      />,
    );

    expect(screen.getByRole('tab', { name: 'All (8)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'For Me (2)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Consultant (5)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sales Lead (3)' })).toBeInTheDocument();
  });

  it('hides All tab when showAll is false', () => {
    render(
      <CertRolePills
        selection={{ type: 'me' }}
        allCount={8}
        myCount={2}
        roles={mockRoles}
        showAll={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByRole('tab', { name: /All/i })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'For Me (2)' })).toBeInTheDocument();
  });

  it('triggers onSelect with role payload when clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn<(selection: FilterSelection) => void>();

    render(
      <CertRolePills
        selection={{ type: 'all' }}
        allCount={8}
        myCount={2}
        roles={mockRoles}
        showAll={true}
        onSelect={handleSelect}
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'Consultant (5)' }));
    expect(handleSelect).toHaveBeenCalledWith({
      type: 'role',
      userTypeId: 'role-1',
    });

    await user.click(screen.getByRole('tab', { name: 'For Me (2)' }));
    expect(handleSelect).toHaveBeenCalledWith({ type: 'me' });
  });
});
