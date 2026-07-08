import { describe, expect, it, beforeEach } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import {
  FakeAuthGateway,
  FakeSessionStore,
  buildAuthSession,
  silentLogger,
} from '@testing';
import { AuthServiceUnavailableError, InvalidCredentialsError } from '../../domain';
import { RefreshSessionUseCase } from './refresh-session';

describe('RefreshSessionUseCase', () => {
  let gateway: FakeAuthGateway;
  let sessionStore: FakeSessionStore;
  let useCase: RefreshSessionUseCase;

  beforeEach(() => {
    gateway = new FakeAuthGateway();
    sessionStore = new FakeSessionStore();
    useCase = new RefreshSessionUseCase({
      authGateway: gateway,
      sessionStore,
      logger: silentLogger(),
    });
  });

  it('saves and returns the refreshed session on success', async () => {
    const session = buildAuthSession({ refreshToken: 'refresh-1' });
    const refreshed = buildAuthSession({ accessToken: 'new-access' });
    gateway.refreshResult = ok(refreshed);

    const result = await useCase.execute(session);

    expect(isOk(result)).toBe(true);
    expect(gateway.lastRefreshToken).toBe('refresh-1');
    expect(sessionStore.current).toBe(refreshed);
    expect(sessionStore.saveCalls).toBe(1);
  });

  it('clears the store and returns the error when the gateway rejects', async () => {
    const session = buildAuthSession({ refreshToken: 'refresh-1' });
    gateway.refreshResult = { ok: false, error: new AuthServiceUnavailableError() };

    const result = await useCase.execute(session);

    expect(isErr(result) && result.error).toBeInstanceOf(AuthServiceUnavailableError);
    expect(sessionStore.clearCalls).toBe(1);
    expect(sessionStore.saveCalls).toBe(0);
  });

  it('clears the store and returns InvalidCredentialsError when there is no refresh token', async () => {
    const session = buildAuthSession({ refreshToken: null });

    const result = await useCase.execute(session);

    expect(isErr(result) && result.error).toBeInstanceOf(InvalidCredentialsError);
    expect(gateway.lastRefreshToken).toBeNull();
    expect(sessionStore.clearCalls).toBe(1);
  });
});
