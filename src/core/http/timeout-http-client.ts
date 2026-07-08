import type { Logger } from '@core/logger/logger';
import type { HttpClient, RequestOptions } from '@core/http/http-client';

export interface TimeoutHttpClientDeps {
  readonly timeoutMs: number;
  readonly logger: Logger;
}

/**
 * Decorator that bounds every request with a deadline. When the timer fires it aborts the request,
 * which causes the inner client's `fetch` to reject and surface as a `NetworkError` — the decorator
 * does not translate the error itself. The caller's own `signal` is merged in, so an external
 * cancellation still aborts the request before the deadline.
 */
export class TimeoutHttpClient implements HttpClient {
  private readonly inner: HttpClient;
  private readonly timeoutMs: number;
  private readonly logger: Logger;

  public constructor(inner: HttpClient, deps: TimeoutHttpClientDeps) {
    this.inner = inner;
    this.timeoutMs = deps.timeoutMs;
    this.logger = deps.logger.child('http-timeout');
  }

  public get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.withTimeout((opts) => this.inner.get<TResponse>(path, opts), options);
  }

  public post<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withTimeout(
      (opts) => this.inner.post<TResponse>(path, body, opts),
      options,
    );
  }

  public put<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withTimeout(
      (opts) => this.inner.put<TResponse>(path, body, opts),
      options,
    );
  }

  public patch<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withTimeout(
      (opts) => this.inner.patch<TResponse>(path, body, opts),
      options,
    );
  }

  public delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.withTimeout((opts) => this.inner.delete<TResponse>(path, opts), options);
  }

  public postForm<TResponse>(
    path: string,
    form: Readonly<Record<string, string>>,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.withTimeout(
      (opts) => this.inner.postForm<TResponse>(path, form, opts),
      options,
    );
  }

  private async withTimeout<T>(
    invoke: (options: RequestOptions) => Promise<T>,
    options?: RequestOptions,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      this.logger.warn('Request exceeded timeout; aborting', {
        timeoutMs: this.timeoutMs,
      });
      controller.abort(new DOMException('Request timed out', 'TimeoutError'));
    }, this.timeoutMs);

    const signals: AbortSignal[] = [controller.signal];
    if (options?.signal !== undefined) {
      signals.push(options.signal);
    }
    const mergedSignal = AbortSignal.any(signals);

    try {
      return await invoke({ ...options, signal: mergedSignal });
    } finally {
      clearTimeout(timer);
    }
  }
}
