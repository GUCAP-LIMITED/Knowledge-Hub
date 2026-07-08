import { describe, expect, it, vi } from 'vitest';
import { silentLogger } from '@testing';
import { type HttpClient, HttpError, NetworkError } from './http-client';
import { AuthRefreshHttpClient } from './auth-refresh-http-client';

const asClient = (partial: Partial<HttpClient>): HttpClient => partial as HttpClient;

const unauthorized = (): HttpError =>
  new HttpError({
    status: 401,
    statusText: 'Unauthorized',
    url: '/x',
    body: null,
    retryAfterMs: null,
  });

/** A `get` that yields the queued outcomes in order; rejects throw, everything else resolves. */
const queuedGet = (
  outcomes: readonly unknown[],
): { get: HttpClient['get']; calls: () => number } => {
  let index = 0;
  const get = (): Promise<never> => {
    const outcome = outcomes[index];
    index += 1;
    if (outcome instanceof Error) {
      return Promise.reject(outcome);
    }
    return Promise.resolve(outcome as never);
  };
  return { get, calls: () => index };
};

describe('AuthRefreshHttpClient', () => {
  it('refreshes once on a 401 and replays the request', async () => {
    const fake = queuedGet([unauthorized(), 'ok']);
    const refresh = vi.fn(() => Promise.resolve(true));
    const client = new AuthRefreshHttpClient(asClient({ get: fake.get }), {
      refresh,
      logger: silentLogger(),
    });

    await expect(client.get<string>('/x')).resolves.toBe('ok');
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fake.calls()).toBe(2);
  });

  it('shares a single refresh across concurrent 401s (single-flight)', async () => {
    const fake = queuedGet([unauthorized(), unauthorized(), 'ok', 'ok']);
    const refresh = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 5);
        }),
    );
    const client = new AuthRefreshHttpClient(asClient({ get: fake.get }), {
      refresh,
      logger: silentLogger(),
    });

    const [a, b] = await Promise.all([
      client.get<string>('/x'),
      client.get<string>('/x'),
    ]);

    expect(a).toBe('ok');
    expect(b).toBe('ok');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh anonymous requests', async () => {
    const error = unauthorized();
    const fake = queuedGet([error]);
    const refresh = vi.fn(() => Promise.resolve(true));
    const client = new AuthRefreshHttpClient(asClient({ get: fake.get }), {
      refresh,
      logger: silentLogger(),
    });

    await expect(client.get<string>('/login', { anonymous: true })).rejects.toBe(error);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('rethrows the original error when refresh fails', async () => {
    const error = unauthorized();
    const fake = queuedGet([error]);
    const refresh = vi.fn(() => Promise.resolve(false));
    const client = new AuthRefreshHttpClient(asClient({ get: fake.get }), {
      refresh,
      logger: silentLogger(),
    });

    await expect(client.get<string>('/x')).rejects.toBe(error);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fake.calls()).toBe(1);
  });

  it('does not loop when the replay also returns 401', async () => {
    const second = unauthorized();
    const fake = queuedGet([unauthorized(), second]);
    const refresh = vi.fn(() => Promise.resolve(true));
    const client = new AuthRefreshHttpClient(asClient({ get: fake.get }), {
      refresh,
      logger: silentLogger(),
    });

    await expect(client.get<string>('/x')).rejects.toBe(second);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fake.calls()).toBe(2);
  });

  it('rethrows non-401 errors without refreshing', async () => {
    const error = new NetworkError('/x', null);
    const fake = queuedGet([error]);
    const refresh = vi.fn(() => Promise.resolve(true));
    const client = new AuthRefreshHttpClient(asClient({ get: fake.get }), {
      refresh,
      logger: silentLogger(),
    });

    await expect(client.get<string>('/x')).rejects.toBe(error);
    expect(refresh).not.toHaveBeenCalled();
  });
});
