import type { Logger } from '@core/logger/logger';
import {
  type HttpClient,
  type RequestOptions,
  HttpError,
  NetworkError,
} from '@core/http/http-client';

export interface RetryHttpClientDeps {
  readonly maxRetries?: number;
  readonly baseDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly logger: Logger;
}

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 300;
const DEFAULT_MAX_DELAY_MS = 5000;

/**
 * Decorator that retries transient failures with exponential backoff and full jitter. Only `GET`
 * is retried: it is the one idempotent verb where replay is always safe. Every other method is
 * forwarded straight through — retrying a `POST`/`PUT`/`PATCH`/`DELETE` risks duplicate side
 * effects. A `Retry-After` hint from the server (captured on `HttpError`) takes precedence over
 * the computed backoff.
 */
export class RetryHttpClient implements HttpClient {
  private readonly inner: HttpClient;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly logger: Logger;

  public constructor(inner: HttpClient, deps: RetryHttpClientDeps) {
    this.inner = inner;
    this.maxRetries = deps.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseDelayMs = deps.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    this.maxDelayMs = deps.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
    this.logger = deps.logger.child('http-retry');
  }

  public get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.withRetry(() => this.inner.get<TResponse>(path, options), options);
  }

  public post<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.inner.post<TResponse>(path, body, options);
  }

  public put<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.inner.put<TResponse>(path, body, options);
  }

  public patch<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.inner.patch<TResponse>(path, body, options);
  }

  public delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.inner.delete<TResponse>(path, options);
  }

  public postForm<TResponse>(
    path: string,
    form: Readonly<Record<string, string>>,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.inner.postForm<TResponse>(path, form, options);
  }

  private async withRetry<T>(
    invoke: () => Promise<T>,
    options?: RequestOptions,
  ): Promise<T> {
    let attempt = 0;
    for (;;) {
      try {
        return await invoke();
      } catch (error) {
        attempt += 1;
        if (
          attempt > this.maxRetries ||
          !this.isRetryable(error) ||
          options?.signal?.aborted === true
        ) {
          throw error;
        }
        const delay = this.computeDelay(error, attempt);
        this.logger.warn('Request failed; retrying', { attempt, delay });
        await this.sleep(delay, options?.signal);
      }
    }
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof NetworkError) {
      return true;
    }
    if (error instanceof HttpError) {
      return error.status === 429 || error.status === 503 || error.status >= 500;
    }
    return false;
  }

  private computeDelay(error: unknown, attempt: number): number {
    if (error instanceof HttpError && error.retryAfterMs !== null) {
      return Math.min(error.retryAfterMs, this.maxDelayMs);
    }
    const exponential = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** (attempt - 1));
    return exponential * (0.5 + Math.random() * 0.5);
  }

  /** Resolve after `delayMs`, or early (without retrying further) if `signal` aborts. */
  private sleep(delayMs: number, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve) => {
      const onAbort = (): void => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, delayMs);
      if (signal !== undefined) {
        signal.addEventListener('abort', onAbort, { once: true });
      }
    });
  }
}
