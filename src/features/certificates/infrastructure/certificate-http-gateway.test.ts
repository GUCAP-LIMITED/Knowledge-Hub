import { describe, expect, it } from 'vitest';
import { HttpError, type HttpClient, type RequestOptions } from '@core/http';
import { isErr, isOk } from '@core/result';
import { silentLogger } from '@testing/fakes/silent-logger';
import { CertificateHttpGateway } from './certificate-http-gateway';

const notImplemented = (): never => {
  throw new Error('not used in this test');
};

const makeHttpClient = (
  respond: (path: string, options?: RequestOptions) => Promise<unknown>,
): HttpClient => ({
  get: <TResponse>(path: string, options?: RequestOptions): Promise<TResponse> =>
    respond(path, options) as Promise<TResponse>,
  post: notImplemented,
  put: notImplemented,
  patch: notImplemented,
  delete: notImplemented,
  postForm: notImplemented,
});

const makeGateway = (httpClient: HttpClient): CertificateHttpGateway =>
  new CertificateHttpGateway({ httpClient, logger: silentLogger() });

describe('CertificateHttpGateway', () => {
  describe('getStatisticsOverview', () => {
    it('fetches statistics overview and maps fields', async () => {
      let recordedPath = '';
      let recordedOptions: RequestOptions | undefined;

      const httpClient = makeHttpClient((path, options) => {
        recordedPath = path;
        recordedOptions = options;
        return Promise.resolve({
          totalIssuedCertificates: 50,
          totalTeamsWithCertificates: 4,
          totalCategories: 6,
          teams: [
            {
              teamId: 'team-sales',
              teamName: 'Sales Team',
              certificateCount: 30,
            },
          ],
          roles: [
            {
              userTypeId: 'role-consultant',
              roleName: 'Consultant',
              certificateCount: 25,
            },
          ],
        });
      });

      const result = await makeGateway(httpClient).getStatisticsOverview('branch-abc');

      expect(recordedPath).toBe('/api/app/certificate/statistics-overview');
      expect(recordedOptions?.query?.branchId).toBe('branch-abc');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.totalIssuedCertificates).toBe(50);
        expect(result.value.totalTeamsWithCertificates).toBe(4);
        expect(result.value.teams[0]?.teamName).toBe('Sales Team');
        expect(result.value.roles[0]?.roleName).toBe('Consultant');
      }
    });

    it('returns error when request fails', async () => {
      const httpClient = makeHttpClient(() =>
        Promise.reject(
          new HttpError({
            status: 500,
            statusText: 'Internal Server Error',
            url: '/api/app/certificate/statistics-overview',
            body: {},
            retryAfterMs: null,
          }),
        ),
      );

      const result = await makeGateway(httpClient).getStatisticsOverview();
      expect(isErr(result)).toBe(true);
    });
  });

  describe('list', () => {
    it('fetches paginated certificate list with query parameters', async () => {
      let recordedOptions: RequestOptions | undefined;

      const httpClient = makeHttpClient((_, options) => {
        recordedOptions = options;
        return Promise.resolve({
          totalCount: 1,
          myTotalCertificates: 1,
          items: [
            {
              id: 'cert-1',
              contentItemTitle: 'Core Sales',
              contentType: 0,
              userName: 'John Doe',
              roleName: 'Consultant',
              blobName: 'user-1/cert-1.png',
              blobUrl: 'https://blob.example.com/cert-1.png',
              issuedAt: '2026-09-01T12:00:00Z',
            },
          ],
        });
      });

      const result = await makeGateway(httpClient).list({
        skipCount: 10,
        maxResultCount: 10,
        filter: 'sales',
        isSelf: true,
      });

      expect(recordedOptions?.query).toEqual({
        skipCount: 10,
        maxResultCount: 10,
        sorting: undefined,
        filter: 'sales',
        userTypeId: undefined,
        isSelf: true,
        branchId: undefined,
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const [first] = result.value.items;
        expect(result.value.totalCount).toBe(1);
        expect(first?.courseName).toBe('Core Sales');
        expect(first?.userName).toBe('John Doe');
      }
    });
  });

  describe('getById', () => {
    it('fetches a single certificate by id', async () => {
      const httpClient = makeHttpClient(() =>
        Promise.resolve({
          id: 'cert-xyz',
          contentItemTitle: 'Core Sales',
          contentType: 0,
          userName: 'John Doe',
          roleName: 'Consultant',
          blobName: 'user-1/cert-xyz.png',
          blobUrl: 'https://blob.example.com/cert-xyz.png',
          issuedAt: '2026-09-01T12:00:00Z',
        }),
      );

      const result = await makeGateway(httpClient).getById('cert-xyz');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('cert-xyz');
        expect(result.value.courseName).toBe('Core Sales');
      }
    });

    it('returns CertificateNotFoundError on 404', async () => {
      const httpClient = makeHttpClient(() =>
        Promise.reject(
          new HttpError({
            status: 404,
            statusText: 'Not Found',
            url: '/api/app/certificate/missing',
            body: {},
            retryAfterMs: null,
          }),
        ),
      );

      const result = await makeGateway(httpClient).getById('missing');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('CERTIFICATES_NOT_FOUND');
      }
    });
  });
});
