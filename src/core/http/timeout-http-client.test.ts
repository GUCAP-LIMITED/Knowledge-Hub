import { describe, expect, it } from 'vitest';
import { silentLogger } from '@testing';
import type { HttpClient, RequestOptions } from './http-client';
import { TimeoutHttpClient } from './timeout-http-client';

const asClient = (partial: Partial<HttpClient>): HttpClient => partial as HttpClient;

describe('TimeoutHttpClient', () => {
  it('resolves a fast call that completes before the timeout', async () => {
    const inner = asClient({
      get: <T>(): Promise<T> => Promise.resolve('ok' as T),
    });
    const client = new TimeoutHttpClient(inner, {
      timeoutMs: 1000,
      logger: silentLogger(),
    });

    await expect(client.get<string>('/x')).resolves.toBe('ok');
  });

  it('aborts the inner request when the timeout elapses', async () => {
    const inner = asClient({
      get: <T>(_path: string, options?: RequestOptions): Promise<T> =>
        new Promise<T>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new Error('aborted'));
          });
        }),
    });
    const client = new TimeoutHttpClient(inner, {
      timeoutMs: 10,
      logger: silentLogger(),
    });

    await expect(client.get<string>('/slow')).rejects.toThrow('aborted');
  });

  it('honors the caller signal via the merged signal', async () => {
    let observed: AbortSignal | undefined;
    const inner = asClient({
      get: <T>(_path: string, options?: RequestOptions): Promise<T> =>
        new Promise<T>((_resolve, reject) => {
          observed = options?.signal;
          options?.signal?.addEventListener('abort', () => {
            reject(new Error('aborted'));
          });
        }),
    });
    const client = new TimeoutHttpClient(inner, {
      timeoutMs: 1000,
      logger: silentLogger(),
    });

    const caller = new AbortController();
    const pending = client.get<string>('/slow', { signal: caller.signal });
    caller.abort();

    await expect(pending).rejects.toThrow('aborted');
    expect(observed).toBeDefined();
    expect(observed?.aborted).toBe(true);
  });
});
