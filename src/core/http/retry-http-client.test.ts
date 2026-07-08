import { describe, expect, it } from 'vitest';
import { silentLogger } from '@testing';
import { type HttpClient, HttpError, NetworkError } from './http-client';
import { RetryHttpClient } from './retry-http-client';

const asClient = (partial: Partial<HttpClient>): HttpClient => partial as HttpClient;

const instantDeps = { baseDelayMs: 0, maxDelayMs: 0, logger: silentLogger() };

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

describe('RetryHttpClient', () => {
  it('retries a GET that fails with NetworkError then succeeds', async () => {
    const fake = queuedGet([
      new NetworkError('/x', null),
      new NetworkError('/x', null),
      'ok',
    ]);
    const client = new RetryHttpClient(asClient({ get: fake.get }), instantDeps);

    await expect(client.get<string>('/x')).resolves.toBe('ok');
    expect(fake.calls()).toBe(3);
  });

  it('does not retry a non-retryable HttpError (400)', async () => {
    const error = new HttpError({
      status: 400,
      statusText: 'Bad Request',
      url: '/x',
      body: null,
      retryAfterMs: null,
    });
    const fake = queuedGet([error]);
    const client = new RetryHttpClient(asClient({ get: fake.get }), instantDeps);

    await expect(client.get<string>('/x')).rejects.toBe(error);
    expect(fake.calls()).toBe(1);
  });

  it('does not retry non-GET methods', async () => {
    const error = new NetworkError('/x', null);
    let calls = 0;
    const post = ((): Promise<never> => {
      calls += 1;
      return Promise.reject(error);
    }) as HttpClient['post'];
    const client = new RetryHttpClient(asClient({ post }), instantDeps);

    await expect(client.post<string>('/x', {})).rejects.toBe(error);
    expect(calls).toBe(1);
  });

  it('honors a Retry-After hint on a 429 without throwing', async () => {
    const fake = queuedGet([
      new HttpError({
        status: 429,
        statusText: 'Too Many Requests',
        url: '/x',
        body: null,
        retryAfterMs: 5,
      }),
      'ok',
    ]);
    const client = new RetryHttpClient(asClient({ get: fake.get }), instantDeps);

    await expect(client.get<string>('/x')).resolves.toBe('ok');
    expect(fake.calls()).toBe(2);
  });

  it('stops after maxRetries and rethrows the last error', async () => {
    const error = new NetworkError('/x', null);
    const fake = queuedGet([error, error, error, error]);
    const client = new RetryHttpClient(asClient({ get: fake.get }), {
      ...instantDeps,
      maxRetries: 2,
    });

    await expect(client.get<string>('/x')).rejects.toBe(error);
    expect(fake.calls()).toBe(3);
  });
});
