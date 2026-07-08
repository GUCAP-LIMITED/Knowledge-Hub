import { describe, expect, it, beforeEach } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import {
  FakeAuthGateway,
  FakeSessionStore,
  buildAuthSession,
  silentLogger,
} from '@testing';
import { EmptyPasswordError, InvalidCredentialsError } from '../../domain';
import { LoginUseCase } from './login';

describe('LoginUseCase', () => {
  let gateway: FakeAuthGateway;
  let sessionStore: FakeSessionStore;
  let useCase: LoginUseCase;

  beforeEach(() => {
    gateway = new FakeAuthGateway();
    sessionStore = new FakeSessionStore();
    useCase = new LoginUseCase({
      authGateway: gateway,
      sessionStore,
      logger: silentLogger(),
    });
  });

  it('rejects an empty password without calling the gateway', async () => {
    const result = await useCase.execute('user@example.com', '   ');
    expect(isErr(result) && result.error).toBeInstanceOf(EmptyPasswordError);
    expect(gateway.lastEmail).toBeNull();
  });

  it('persists the session on success', async () => {
    const session = buildAuthSession();
    gateway.authenticateResult = ok(session);

    const result = await useCase.execute('user@example.com', 'password');

    expect(isOk(result)).toBe(true);
    expect(gateway.lastEmail).toBe('user@example.com');
    expect(sessionStore.current).toBe(session);
    expect(sessionStore.saveCalls).toBe(1);
  });

  it('does not persist on authentication failure', async () => {
    gateway.authenticateResult = { ok: false, error: new InvalidCredentialsError() };

    const result = await useCase.execute('user@example.com', 'bad-password');

    expect(isErr(result)).toBe(true);
    expect(sessionStore.saveCalls).toBe(0);
  });
});
