import { describe, expect, it, beforeEach } from 'vitest';
import { ok } from '@core/result';
import { FixedClock } from '@core/time';
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
import { createAuthStore, type AuthStore } from './auth-store';

interface Harness {
  readonly store: AuthStore;
  readonly gateway: FakeAuthGateway;
  readonly sessionStore: FakeSessionStore;
  readonly tokens: (string | null)[];
}

const createHarness = (): Harness => {
  const gateway = new FakeAuthGateway();
  const sessionStore = new FakeSessionStore();
  const logger = silentLogger();
  const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
  const tokens: (string | null)[] = [];

  const store = createAuthStore({
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
    setAccessToken: (token) => tokens.push(token),
  });

  return { store, gateway, sessionStore, tokens };
};

describe('auth store', () => {
  let harness: Harness;

  beforeEach(() => {
    harness = createHarness();
  });

  it('starts in the initializing state', () => {
    expect(harness.store.getState().status).toBe('initializing');
  });

  it('authenticates and exposes the user on successful login', async () => {
    const session = buildAuthSession({ accessToken: 'token-xyz' });
    harness.gateway.authenticateResult = ok(session);

    const succeeded = await harness.store
      .getState()
      .login('user@example.com', 'password');

    expect(succeeded).toBe(true);
    const state = harness.store.getState();
    expect(state.status).toBe('authenticated');
    expect(state.session).toBe(session);
    expect(state.error).toBeNull();
    expect(harness.tokens).toContain('token-xyz');
  });

  it('surfaces a friendly error on failed login', async () => {
    const succeeded = await harness.store
      .getState()
      .login('user@example.com', 'bad-password');

    expect(succeeded).toBe(false);
    const state = harness.store.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.error).not.toBeNull();
  });

  it('clears state and revokes on logout', async () => {
    harness.gateway.authenticateResult = ok(buildAuthSession());
    await harness.store.getState().login('user@example.com', 'password');

    await harness.store.getState().logout();

    const state = harness.store.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.session).toBeNull();
    expect(harness.gateway.signOutCalls).toBe(1);
    expect(harness.tokens.at(-1)).toBeNull();
  });

  it('resolves to unauthenticated when there is no stored session', async () => {
    await harness.store.getState().initialize();
    expect(harness.store.getState().status).toBe('unauthenticated');
  });
});
