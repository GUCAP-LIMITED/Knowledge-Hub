import { AppError } from '@core/errors/app-error';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryValue = string | number | boolean | undefined;

export interface RequestOptions {
  readonly headers?: Readonly<Record<string, string>>;
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly signal?: AbortSignal;
  /** Skip attaching the bearer token (e.g. the token endpoint itself). */
  readonly anonymous?: boolean;
}

/**
 * Transport abstraction. Higher layers depend on this interface — never on `fetch`/`axios` —
 * so the network implementation is swappable and trivially mockable in tests.
 *
 * Implementations THROW `HttpError`/`NetworkError`. Repositories (infrastructure) are responsible
 * for catching these and translating them into domain `Result`s.
 */
export interface HttpClient {
  get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse>;
  post<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse>;
  put<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse>;
  patch<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse>;
  delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse>;
  /** Send `application/x-www-form-urlencoded` — required by the OAuth token endpoint. */
  postForm<TResponse>(
    path: string,
    form: Readonly<Record<string, string>>,
    options?: RequestOptions,
  ): Promise<TResponse>;
}

export interface HttpErrorProps {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: unknown;
  /** Parsed `Retry-After` (ms) when the server sent one; otherwise `null`. */
  readonly retryAfterMs: number | null;
}

/** The server responded with a non-2xx status. */
export class HttpError extends AppError {
  public readonly code = 'HTTP';
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;
  public readonly body: unknown;
  public readonly retryAfterMs: number | null;

  public constructor(props: HttpErrorProps) {
    super(`HTTP ${String(props.status)} ${props.statusText} for ${props.url}`, {
      context: { status: props.status, url: props.url },
    });
    this.status = props.status;
    this.statusText = props.statusText;
    this.url = props.url;
    this.body = props.body;
    this.retryAfterMs = props.retryAfterMs;
  }
}

/** The request never produced a response (offline, DNS, CORS, timeout, abort). */
export class NetworkError extends AppError {
  public readonly code = 'NETWORK';

  public constructor(url: string, cause: unknown) {
    super(`Network request to ${url} failed`, { cause, context: { url } });
  }
}
