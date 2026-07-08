import { describe, expect, it, beforeEach } from 'vitest';
import { isOk, ok } from '@core/result';
import { FixedClock } from '@core/time';
import {
  FakeAuthGateway,
  FakeSessionStore,
  buildAuthSession,
  silentLogger,
} from '@testing';
import { InvalidCredentialsError } from '../../domain';
import { RestoreSessionUseCase } from './restore-session';

describe('RestoreSessionUseCase', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  let gateway: FakeAuthGateway;
  let sessionStore: FakeSessionStore;
  let clock: FixedClock;

  const buildUseCase = (): RestoreSessionUseCase =>
    new RestoreSessionUseCase({
      authGateway: gateway,
      sessionStore,
      clock,
      logger: silentLogger(),
    });

  beforeEach(() => {
    gateway = new FakeAuthGateway();
    sessionStore = new FakeSessionStore();
    clock = new FixedClock(now);
  });

  it('returns null when nothing is stored', async () => {
    const result = await buildUseCase().execute();
    expect(isOk(result) && result.value).toBeNull();
  });

  it('returns the stored session when still valid', async () => {
    const session = buildAuthSession({ expiresAt: new Date(now.getTime() + 600_000) });
    sessionStore.current = session;

    const result = await buildUseCase().execute();
    expect(isOk(result) && result.value).toBe(session);
  });

  it('refreshes an expired session when a refresh token exists', async () => {
    sessionStore.current = buildAuthSession({
      expiresAt: new Date(now.getTime() - 1000),
      refreshToken: 'refresh-1',
    });
    const refreshed = buildAuthSession({ expiresAt: new Date(now.getTime() + 600_000) });
    gateway.refreshResult = ok(refreshed);

    const result = await buildUseCase().execute();

    expect(gateway.lastRefreshToken).toBe('refresh-1');
    expect(isOk(result) && result.value).toBe(refreshed);
    expect(sessionStore.current).toBe(refreshed);
  });

  it('clears and returns null when refresh fails', async () => {
    sessionStore.current = buildAuthSession({
      expiresAt: new Date(now.getTime() - 1000),
      refreshToken: 'refresh-1',
    });
    gateway.refreshResult = { ok: false, error: new InvalidCredentialsError() };

    const result = await buildUseCase().execute();

    expect(isOk(result) && result.value).toBeNull();
    expect(sessionStore.clearCalls).toBe(1);
  });

  it('clears and returns null when expired with no refresh token', async () => {
    sessionStore.current = buildAuthSession({
      expiresAt: new Date(now.getTime() - 1000),
      refreshToken: null,
    });

    const result = await buildUseCase().execute();

    expect(isOk(result) && result.value).toBeNull();
    expect(sessionStore.clearCalls).toBe(1);
    expect(gateway.lastRefreshToken).toBeNull();
  });
});
