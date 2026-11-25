import { type HttpClient, type RequestOptions, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { MockRouteMatcher } from './mock-route-matcher';
import { MockHttpFailure, type MockRoute } from './mock-types';
import { userIdFromAccessToken } from './seed/mock-tokens';

export interface MockHttpClientDeps {
  readonly routes: readonly MockRoute[];
  readonly logger: Logger;
  readonly getAuthToken: () => string | undefined;
  /** Simulated network latency in ms (0 in tests). */
  readonly latencyMs?: number;
  /** Called after every successful write (POST/PUT/PATCH/DELETE), e.g. to persist the mock state. */
  readonly onWrite?: () => void;
}

/** URL query string plus any `options.query` entries, as plain strings. */
const mergeQuery = (
  url: URL,
  extra: Readonly<Record<string, string | number | boolean | undefined>> | undefined,
): Record<string, string> => {
  const query = Object.fromEntries(url.searchParams);
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined) {
      query[key] = String(value);
    }
  }
  return query;
};

const JSON_ROUNDTRIP = (value: unknown): unknown =>
  value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as unknown);

/**
 * An in-memory stand-in for the Academy backend. It implements the same `HttpClient` port as the
 * real `FetchHttpClient`, so every gateway, Zod DTO and mapper runs unchanged; going live is a
 * one-line swap in the composition root.
 */
export class MockHttpClient implements HttpClient {
  private readonly matcher: MockRouteMatcher;
  private readonly logger: Logger;
  private readonly getAuthToken: () => string | undefined;
  private readonly latencyMs: number;
  private readonly onWrite: (() => void) | undefined;

  public constructor(deps: MockHttpClientDeps) {
    this.matcher = new MockRouteMatcher(deps.routes);
    this.logger = deps.logger.child('mock-api');
    this.getAuthToken = deps.getAuthToken;
    this.latencyMs = deps.latencyMs ?? 120;
    this.onWrite = deps.onWrite;
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.send<T>('GET', path, undefined, options);
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.send<T>('POST', path, body, options);
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.send<T>('PUT', path, body, options);
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.send<T>('PATCH', path, body, options);
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.send<T>('DELETE', path, undefined, options);
  }

  public postForm<T>(
    path: string,
    form: Readonly<Record<string, string>>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.send<T>('POST', path, form, options);
  }

  private async send<T>(
    method: string,
    rawPath: string,
    body: unknown,
    options: RequestOptions | undefined,
  ): Promise<T> {
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
    const url = new URL(rawPath, 'http://mock.local');
    const query = mergeQuery(url, options?.query);

    const match = this.matcher.match(method, url.pathname);
    if (match === null) {
      this.logger.warn(`No mock route for ${method} ${url.pathname}`);
      throw this.httpError(404, 'Not Found', rawPath, {
        error: { message: `No mock handler for ${method} ${url.pathname}` },
      });
    }

    const token = options?.anonymous === true ? undefined : this.getAuthToken();
    try {
      const result = match.route.handler({
        method,
        path: url.pathname,
        params: match.params,
        query,
        body: JSON_ROUNDTRIP(body),
        userId: token === undefined ? null : userIdFromAccessToken(token),
      });
      if (method !== 'GET') {
        this.onWrite?.();
      }
      return JSON_ROUNDTRIP(result) as T;
    } catch (cause) {
      if (cause instanceof MockHttpFailure) {
        throw this.httpError(cause.status, cause.message, rawPath, cause.body);
      }
      throw cause;
    }
  }

  private httpError(
    status: number,
    statusText: string,
    url: string,
    body: unknown,
  ): HttpError {
    return new HttpError({ status, statusText, url, body, retryAfterMs: null });
  }
}
