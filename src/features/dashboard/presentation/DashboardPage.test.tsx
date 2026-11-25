import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';

let mockCanManage = false;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (_resource: string, action: string) =>
      action === 'manage' ? mockCanManage : true,
  }),
}));

vi.mock('./components/DynamicDashboard', () => ({
  DynamicDashboard: ({ canEdit }: { readonly canEdit: boolean }) => (
    <div data-testid="dynamic-dashboard" data-can-edit={String(canEdit)}>
      Dynamic Dashboard
    </div>
  ),
}));

describe('<DashboardPage />', () => {
  it('enables editing when user has dashboard:manage capability', () => {
    mockCanManage = true;

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    const el = screen.getByTestId('dynamic-dashboard');
    expect(el).toHaveAttribute('data-can-edit', 'true');
  });

  it('disables editing when user lacks dashboard:manage capability', () => {
    mockCanManage = false;

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    const el = screen.getByTestId('dynamic-dashboard');
    expect(el).toHaveAttribute('data-can-edit', 'false');
  });
});
