import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ok } from '@core/result';
import {
  FakeAuthGateway,
  FakeSessionStore,
  buildAuthSession,
  silentLogger,
} from '@testing';
import {
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RestoreSessionUseCase,
} from '../application';
import { FixedClock } from '@core/time';
import { createAuthStore, type AuthStore } from '../store';
import { AuthStoreProvider } from './AuthStoreProvider';
import { LoginPage } from './LoginPage';

const buildStore = (gateway: FakeAuthGateway): AuthStore => {
  const sessionStore = new FakeSessionStore();
  const logger = silentLogger();
  const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
  return createAuthStore({
    loginUseCase: new LoginUseCase({ authGateway: gateway, sessionStore, logger }),
    logoutUseCase: new LogoutUseCase({ authGateway: gateway, sessionStore, logger }),
    restoreSessionUseCase: new RestoreSessionUseCase({
      authGateway: gateway,
      sessionStore,
      clock,
      logger,
    }),
    refreshSessionUseCase: new RefreshSessionUseCase({
      authGateway: gateway,
      sessionStore,
      logger,
    }),
    setAccessToken: () => undefined,
  });
};

const renderLogin = (gateway: FakeAuthGateway): void => {
  render(
    <MemoryRouter>
      <AuthStoreProvider store={buildStore(gateway)}>
        <LoginPage />
      </AuthStoreProvider>
    </MemoryRouter>,
  );
};

describe('<LoginPage />', () => {
  it('shows a validation-driven error when authentication fails', async () => {
    const user = userEvent.setup();
    renderLogin(new FakeAuthGateway());

    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid or have expired/i,
    );
  });

  it('keeps the submit button disabled when credentials are empty', async () => {
    const user = userEvent.setup();
    const gateway = new FakeAuthGateway();
    gateway.authenticateResult = ok(buildAuthSession());
    renderLogin(gateway);

    // The demo screen prefills credentials; clearing them must disable submit.
    await user.clear(screen.getByLabelText('Email'));
    await user.clear(screen.getByLabelText('Password'));

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });
});
