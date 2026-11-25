import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DynamicDashboard } from './DynamicDashboard';

const MOCK_USER = {
  id: 'user-1',
  userType: 'BranchManager',
  userTypeId: 'ut-bm',
};

const MOCK_AUTH = {
  user: MOCK_USER,
};

const MOCK_MY_DASHBOARD_RESULT = {
  data: {
    id: 'dash-mine',
    name: 'My view',
    userTypeId: 'ut-bm',
    isDefault: false,
    widgets: [],
  },
  isPending: false,
  isError: false,
};

const MOCK_MUTATION = {
  mutate: vi.fn(),
  isPending: false,
};

vi.mock('@features/auth', () => ({
  useAuth: () => MOCK_AUTH,
}));

vi.mock('./AddWidgetModal', () => ({
  AddWidgetModal: ({ open }: { readonly open: boolean }) =>
    open ? <div data-testid="add-widget-modal">Modal Content</div> : null,
}));

vi.mock('../use-dashboard', () => ({
  useMyDashboard: () => MOCK_MY_DASHBOARD_RESULT,
  useSaveMyDashboard: () => MOCK_MUTATION,
  useResetMyDashboard: () => MOCK_MUTATION,
}));

describe('<DynamicDashboard />', () => {
  it('allows users to manage personal dashboard and opens add widget modal', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DynamicDashboard canEdit={true} />
      </MemoryRouter>,
    );

    // "Manage dashboards" should be visible
    const manageBtn = screen.getByRole('button', { name: /manage dashboards/i });
    expect(manageBtn).toBeInTheDocument();

    // Enter edit mode
    await user.click(manageBtn);

    // Click Add Widget
    await user.click(screen.getByRole('button', { name: /add widget to dashboard/i }));

    // Verify modal is open
    const modal = screen.getByTestId('add-widget-modal');
    expect(modal).toBeInTheDocument();
  });

  it('hides edit controls when canEdit is false', () => {
    render(
      <MemoryRouter>
        <DynamicDashboard canEdit={false} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('button', { name: /manage dashboards/i }),
    ).not.toBeInTheDocument();
  });
});
