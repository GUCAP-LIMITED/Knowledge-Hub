import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserTypeDashboardSelector } from './UserTypeDashboardSelector';

const MOCK_USER_TYPES = [
  { id: 'ut-admin', name: 'Admin' },
  { id: 'ut-counselor', name: 'Counselor' },
];

vi.mock('@features/user-types', () => ({
  useSelectableUserTypes: () => ({
    data: MOCK_USER_TYPES,
    isPending: false,
  }),
}));

describe('<UserTypeDashboardSelector />', () => {
  it('renders with placeholder "View by user type" when no value is selected', () => {
    render(<UserTypeDashboardSelector value={null} onChange={vi.fn()} />);

    const trigger = screen.getByRole('combobox', { name: 'User Type' });
    expect(trigger).toHaveTextContent('View by user type');
  });

  it('renders user type names without the word template in the options', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<UserTypeDashboardSelector value={null} onChange={handleChange} />);

    await user.click(screen.getByRole('combobox', { name: 'User Type' }));

    const adminOption = await screen.findByRole('option', { name: 'Admin' });
    const counselorOption = await screen.findByRole('option', { name: 'Counselor' });

    expect(adminOption).toBeInTheDocument();
    expect(counselorOption).toBeInTheDocument();
    expect(screen.queryByText(/template/i)).not.toBeInTheDocument();

    await user.click(adminOption);
    expect(handleChange).toHaveBeenCalledWith('ut-admin', 'Admin');
  });

  it('shows "My view" when includePersonal is true and value is null', () => {
    render(
      <UserTypeDashboardSelector
        value={null}
        onChange={vi.fn()}
        includePersonal={true}
      />,
    );

    const trigger = screen.getByRole('combobox', { name: 'User Type' });
    expect(trigger).toHaveTextContent('My view');
  });
});
