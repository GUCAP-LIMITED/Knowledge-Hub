import type { Logger } from '@core/logger/logger';
import { type HttpClient, type RequestOptions, HttpError } from '@core/http/http-client';

export interface AuthRefreshHttpClientDeps {
  /** Attempt to obtain a fresh token. Returns `true` if one is now available. */
  readonly refresh: () => Promise<boolean>;
  readonly logger: Logger;
}

/**
 * Decorator that transparently recovers from an expired access token. On a `401` it triggers a
 * single token refresh and replays the request exactly once. Concurrent `401`s share one in-flight
 * refresh (single-flight), and anonymous requests (e.g. the token endpoint itself) are never
 * refreshed — both guard against refresh storms and infinite recursion. `refresh` is injected, so
 * core stays free of any feature dependency.
 */
export class AuthRefreshHttpClient implements HttpClient {
  private readonly inner: HttpClient;
  private readonly refresh: () => Promise<boolean>;
  private readonly logger: Logger;
  private inFlightRefresh: Promise<boolean> | null = null;

  public constructor(inner: HttpClient, deps: AuthRefreshHttpClientDeps) {
    this.inner = inner;
    this.refresh = deps.refresh;
    this.logger = deps.logger.child('http-auth-refresh');
  }

  public get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.withRefresh((opts) => this.inner.get<TResponse>(path, opts), options);
  }

  public post<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withRefresh(
      (opts) => this.inner.post<TResponse>(path, body, opts),
      options,
    );
  }

  public put<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withRefresh(
      (opts) => this.inner.put<TResponse>(path, body, opts),
      options,
    );
  }

  public patch<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withRefresh(
      (opts) => this.inner.patch<TResponse>(path, body, opts),
      options,
    );
  }

  public delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.withRefresh((opts) => this.inner.delete<TResponse>(path, opts), options);
  }

  public postForm<TResponse>(
    path: string,
    form: Readonly<Record<string, string>>,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withRefresh(
      (opts) => this.inner.postForm<TResponse>(path, form, opts),
      options,
    );
  }

  private async withRefresh<T>(
    invoke: (options?: RequestOptions) => Promise<T>,
    options?: RequestOptions,
  ): Promise<T> {
    try {
      return await invoke(options);
    } catch (error) {
      if (
        options?.anonymous === true ||
        !(error instanceof HttpError) ||
        error.status !== 401
      ) {
        throw error;
      }

      const refreshed = await this.refreshOnce();
      if (!refreshed) {
        throw error;
      }
      // Replay exactly once. A second 401 propagates — no retry loop.
      return invoke(options);
    }
  }

  private refreshOnce(): Promise<boolean> {
    this.inFlightRefresh ??= this.runRefresh();
    return this.inFlightRefresh;
  }

  private async runRefresh(): Promise<boolean> {
    try {
      return await this.refresh();
    } catch (error) {
      this.logger.warn('Token refresh threw; treating as failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    } finally {
      this.inFlightRefresh = null;
    }
  }
}
