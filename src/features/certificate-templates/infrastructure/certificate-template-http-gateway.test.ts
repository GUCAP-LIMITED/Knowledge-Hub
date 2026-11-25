import { describe, expect, it } from 'vitest';
import { HttpError, type HttpClient } from '@core/http';
import { isErr, isOk } from '@core/result';
import { silentLogger } from '@testing/fakes/silent-logger';
import { CertificateTemplateHttpGateway } from './certificate-template-http-gateway';

const notImplemented = (): never => {
  throw new Error('not used in this test');
};

/** `respond` returns the raw JSON body (or rejects with an `HttpError`) for a given path — this
 * wrapper supplies the generic `<TResponse>` signature `HttpClient.get` requires. */
const makeHttpClient = (respond: (path: string) => Promise<unknown>): HttpClient => ({
  get: <TResponse>(path: string): Promise<TResponse> =>
    respond(path) as Promise<TResponse>,
  post: notImplemented,
  put: notImplemented,
  patch: notImplemented,
  delete: notImplemented,
  postForm: notImplemented,
});

const makeGateway = (httpClient: HttpClient): CertificateTemplateHttpGateway =>
  new CertificateTemplateHttpGateway({ httpClient, logger: silentLogger() });

describe('CertificateTemplateHttpGateway.get', () => {
  it('fetches by the numeric kind path segment the backend expects (course=0, tutorial=5, resource=10)', async () => {
    const calledPaths: string[] = [];
    const httpClient = makeHttpClient((path) => {
      calledPaths.push(path);
      return Promise.resolve({ content: '<html></html>', lastModificationTime: null });
    });
    const gateway = makeGateway(httpClient);

    await gateway.get('course');
    await gateway.get('tutorial');
    await gateway.get('resource');

    expect(calledPaths).toEqual([
      '/api/app/certificate-template/0',
      '/api/app/certificate-template/5',
      '/api/app/certificate-template/10',
    ]);
  });

  it('maps a successful response to a record for the requested kind', async () => {
    const httpClient = makeHttpClient(() =>
      Promise.resolve({
        content: '<html></html>',
        lastModificationTime: '2026-01-01T00:00:00Z',
      }),
    );
    const result = await makeGateway(httpClient).get('course');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual({
        kind: 'course',
        content: '<html></html>',
        lastModificationTime: '2026-01-01T00:00:00Z',
      });
    }
  });

  it('resolves ok(null) on a 404 — no template saved yet is not an error', async () => {
    const httpClient = makeHttpClient(() =>
      Promise.reject(
        new HttpError({
          status: 404,
          statusText: 'Not Found',
          url: '/api/app/certificate-template/0',
          body: null,
          retryAfterMs: null,
        }),
      ),
    );
    const result = await makeGateway(httpClient).get('course');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBeNull();
    }
  });

  it('returns a load-failed error for any other failure', async () => {
    const httpClient = makeHttpClient(() =>
      Promise.reject(
        new HttpError({
          status: 500,
          statusText: 'Server Error',
          url: '/api/app/certificate-template/0',
          body: null,
          retryAfterMs: null,
        }),
      ),
    );
    const result = await makeGateway(httpClient).get('course');

    expect(isErr(result)).toBe(true);
  });
});
