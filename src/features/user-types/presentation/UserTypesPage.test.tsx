import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserTypesPage } from './UserTypesPage';

vi.mock('./UserTypesManager', () => ({
  UserTypesManager: () => (
    <div data-testid="user-types-manager">MockUserTypesManager</div>
  ),
}));

describe('<UserTypesPage />', () => {
  it('renders the header with title, subtitle and back link to Users', () => {
    render(
      <MemoryRouter initialEntries={['/settings/users/user-types']}>
        <UserTypesPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /manage user types/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create or remove custom user types in the hierarchy/i),
    ).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back to users/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/settings/users');
    expect(backLink).toHaveTextContent('Users');
    expect(screen.getByTestId('user-types-manager')).toBeInTheDocument();
  });

  it('navigates to /settings/users when clicking the back link', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/settings/users/user-types']}>
        <Routes>
          <Route path="/settings/users/user-types" element={<UserTypesPage />} />
          <Route
            path="/settings/users"
            element={<div data-testid="users-destination">Users Section</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    const backLink = screen.getByRole('link', { name: /back to users/i });
    await user.click(backLink);

    expect(screen.getByTestId('users-destination')).toBeInTheDocument();
  });
});
