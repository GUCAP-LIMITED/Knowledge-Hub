import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigureDashboardPage } from './ConfigureDashboardPage';

let mockCanManage = false;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (_module: string, action: string) => action === 'manage' && mockCanManage,
  }),
}));

vi.mock('./use-dashboard', () => ({
  useByUserTypeDashboard: () => ({
    data: null,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useSaveDashboardTemplate: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useWidgetCatalog: () => ({
    data: [],
    isPending: false,
    isError: false,
  }),
}));

vi.mock('@features/user-types', () => ({
  useSelectableUserTypes: () => ({
    data: [{ id: 'ut-1', name: 'BranchManager' }],
    isPending: false,
  }),
}));

describe('<ConfigureDashboardPage />', () => {
  it('renders Access Denied when the user lacks the dashboard:manage capability', () => {
    mockCanManage = false;

    render(
      <MemoryRouter>
        <ConfigureDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText('You do not have permission to configure user dashboards.'),
    ).toBeInTheDocument();
  });

  it('renders dashboard configuration interface when the user has the dashboard:manage capability', () => {
    mockCanManage = true;

    render(
      <MemoryRouter>
        <ConfigureDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Configure Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Back to my dashboard')).toBeInTheDocument();
    expect(screen.getByText('Select a User Type')).toBeInTheDocument();
  });

  it('renders embedded layout without header when hideHeader is true', () => {
    mockCanManage = true;

    const { container } = render(
      <MemoryRouter>
        <ConfigureDashboardPage hideHeader />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Configure Dashboards')).not.toBeInTheDocument();
    expect(screen.queryByText('Back to my dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Select a User Type')).toBeInTheDocument();

    const main = container.querySelector('main');
    expect(main?.className).toMatch(/screenEmbedded/);
  });

  it('applies standalone styling when hideHeader is false', () => {
    mockCanManage = true;

    const { container } = render(
      <MemoryRouter>
        <ConfigureDashboardPage hideHeader={false} />
      </MemoryRouter>,
    );

    const main = container.querySelector('main');
    expect(main?.className).toMatch(/screenStandalone/);
  });
});
