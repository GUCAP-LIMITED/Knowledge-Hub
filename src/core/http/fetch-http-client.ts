import type { Logger } from '@core/logger/logger';
import {
  type HttpClient,
  type HttpMethod,
  type QueryValue,
  type RequestOptions,
  HttpError,
  NetworkError,
} from '@core/http/http-client';

/** Supplies the current bearer token, or `undefined` when anonymous. */
export type AuthTokenProvider = () => string | undefined;

export interface FetchHttpClientDeps {
  readonly baseUrl: string;
  readonly logger: Logger;
  readonly getAuthToken: AuthTokenProvider;
}

/**
 * `fetch`-based `HttpClient`. The only place in the app that talks to the network directly.
 * It is intentionally small and dependency-light; cross-cutting concerns (auth header, logging,
 * error translation) are handled here once.
 */
export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly logger: Logger;
  private readonly getAuthToken: AuthTokenProvider;

  public constructor(deps: FetchHttpClientDeps) {
    this.baseUrl = deps.baseUrl;
    this.logger = deps.logger.child('http');
    this.getAuthToken = deps.getAuthToken;
  }

  public get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.send<TResponse>('GET', path, undefined, options);
  }

  public post<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.send<TResponse>('POST', path, this.jsonBody(body), options);
  }

  public put<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.send<TResponse>('PUT', path, this.jsonBody(body), options);
  }

  public patch<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.send<TResponse>('PATCH', path, this.jsonBody(body), options);
  }

  public delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.send<TResponse>('DELETE', path, undefined, options);
  }

  public postForm<TResponse>(
    path: string,
    form: Readonly<Record<string, string>>,
    options?: RequestOptions,
  ): Promise<TResponse> {
    const body: BodyInit = new URLSearchParams(form).toString();
    return this.send<TResponse>(
      'POST',
      path,
      { body, contentType: FORM_CONTENT_TYPE },
      options,
    );
  }

  private jsonBody(body: unknown): EncodedBody | undefined {
    if (body === undefined) {
      return undefined;
    }
    return { body: JSON.stringify(body), contentType: 'application/json' };
  }

  private async send<TResponse>(
    method: HttpMethod,
    path: string,
    encoded: EncodedBody | undefined,
    options?: RequestOptions,
  ): Promise<TResponse> {
    const url = this.buildUrl(path, options?.query);
    const init: RequestInit = {
      method,
      headers: this.buildHeaders(encoded, options),
    };
    if (encoded !== undefined) {
      init.body = encoded.body;
    }
    if (options?.signal !== undefined) {
      init.signal = options.signal;
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (cause) {
      this.logger.error('Request failed before a response was received', cause, { url });
      throw new NetworkError(url, cause);
    }

    return this.handleResponse<TResponse>(response, url);
  }

  private async handleResponse<TResponse>(
    response: Response,
    url: string,
  ): Promise<TResponse> {
    const payload = await this.readBody(response);

    if (!response.ok) {
      this.logger.warn('Request returned a non-2xx status', {
        url,
        status: response.status,
      });
      const retryAfterMs = this.parseRetryAfter(response.headers.get('Retry-After'));
      throw new HttpError({
        status: response.status,
        statusText: response.statusText,
        url,
        body: payload,
        retryAfterMs,
      });
    }

    return payload as TResponse;
  }

  /**
   * Translate a `Retry-After` header into milliseconds. Supports both forms from RFC 7231:
   * a numeric delay in seconds, or an HTTP-date. Anything missing or unparseable yields `null`.
   */
  private parseRetryAfter(value: string | null): number | null {
    if (value === null || value.length === 0) {
      return null;
    }

    const seconds = Number(value);
    if (!Number.isNaN(seconds)) {
      return seconds >= 0 ? seconds * 1000 : null;
    }

    const dateMs = Date.parse(value);
    if (Number.isNaN(dateMs)) {
      return null;
    }
    return Math.max(0, dateMs - Date.now());
  }

  private async readBody(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
      return undefined;
    }
    const text = await response.text();
    if (text.length === 0) {
      return undefined;
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return text;
    }
    return JSON.parse(text) as unknown;
  }

  private buildHeaders(
    encoded: EncodedBody | undefined,
    options?: RequestOptions,
  ): Headers {
    const headers = new Headers({ Accept: 'application/json', ...options?.headers });

    if (encoded) {
      headers.set('Content-Type', encoded.contentType);
    }

    if (!options?.anonymous) {
      const token = this.getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private buildUrl(path: string, query?: Readonly<Record<string, QueryValue>>): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }
}

const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

interface EncodedBody {
  readonly body: BodyInit;
  readonly contentType: string;
}
