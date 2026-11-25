import { describe, expect, it } from 'vitest';
import { type HttpClient, HttpError, type RequestOptions } from '@core/http';
import { isErr, isOk } from '@core/result';
import { silentLogger } from '@testing/fakes/silent-logger';
import { buildResource } from '@testing/builders/resource.builder';
import { HttpResourceGateway } from './http-resource-gateway';

const notImplemented = (): never => {
  throw new Error('not used in this test');
};

interface RecordedPost {
  readonly path: string;
  readonly body: unknown;
  readonly options: RequestOptions | undefined;
}

interface RecordedPut {
  readonly path: string;
  readonly body: unknown;
  readonly options: RequestOptions | undefined;
}

interface RecordedDelete {
  readonly path: string;
  readonly options: RequestOptions | undefined;
}

const makeHttpClient = (
  respond: (path: string) => Promise<unknown>,
  postCalls: RecordedPost[] = [],
  putCalls: RecordedPut[] = [],
  deleteCalls: RecordedDelete[] = [],
): HttpClient => ({
  get: <TResponse>(path: string): Promise<TResponse> =>
    respond(path) as Promise<TResponse>,
  post: <TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> => {
    postCalls.push({ path, body, options });
    return respond(path) as Promise<TResponse>;
  },
  put: <TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> => {
    putCalls.push({ path, body, options });
    return respond(path) as Promise<TResponse>;
  },
  patch: notImplemented,
  delete: <TResponse>(path: string, options?: RequestOptions): Promise<TResponse> => {
    deleteCalls.push({ path, options });
    return respond(path) as Promise<TResponse>;
  },
  postForm: notImplemented,
});

const makeGateway = (httpClient: HttpClient): HttpResourceGateway =>
  new HttpResourceGateway({ httpClient, logger: silentLogger() });

const RESOURCE_ROW = {
  id: 'res-1',
  title: 'Engineering Guidelines',
  description: 'Standard operating procedures for dev team',
  type: 'Guide',
  categoryId: 'cat-42',
  categoryName: 'Policies & SOPs',
  category: 'Policies & SOPs',
  helpfulCount: 42,
  isHelpful: true,
  isCompleted: true,
  completedAt: '2026-09-10T10:00:00Z',
  averageRating: 4.8,
  totalReviews: 15,
};

describe('HttpResourceGateway', () => {
  describe('getStats', () => {
    it('fetches and maps resource stats successfully', async () => {
      const client = makeHttpClient((path) => {
        if (path === '/api/app/resource/stats') {
          return Promise.resolve({
            totalCount: 15,
            categories: [
              { categoryId: 'cat-1', name: 'FAQs', slug: 'faqs', count: 5 },
              { categoryId: 'cat-2', name: 'Guides', slug: 'guides', count: 10 },
            ],
          });
        }
        return Promise.reject(new Error(`Unexpected GET ${path}`));
      });

      const gateway = makeGateway(client);
      const result = await gateway.getStats();

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.totalCount).toBe(15);
        expect(result.value.categories).toHaveLength(2);
        expect(result.value.categories[0]?.name).toBe('FAQs');
        expect(result.value.categories[0]?.count).toBe(5);
        expect(result.value.categories[1]?.name).toBe('Guides');
        expect(result.value.categories[1]?.count).toBe(10);
      }
    });

    it('returns ResourcesUnavailableError on HTTP failure', async () => {
      const client = makeHttpClient(() =>
        Promise.reject(
          new HttpError({
            status: 500,
            statusText: 'Internal Server Error',
            url: '/api/app/resource/stats',
            body: {},
            retryAfterMs: null,
          }),
        ),
      );

      const gateway = makeGateway(client);
      const result = await gateway.getStats();

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('RESOURCES_UNAVAILABLE');
      }
    });
  });

  describe('list', () => {
    it('fetches catalog with query parameters and maps items including canModify', async () => {
      let requestedPath = '';
      const client = makeHttpClient((path) => {
        requestedPath = path;
        return Promise.resolve({
          items: [
            { ...RESOURCE_ROW, canModify: true },
            { ...RESOURCE_ROW, id: 'res-2' },
          ],
          totalCount: 2,
        });
      });

      const gateway = makeGateway(client);
      const result = await gateway.list({
        category: 'Policies & SOPs',
        filter: 'engineering',
        skipCount: 0,
        maxResultCount: 10,
      });

      expect(requestedPath).toContain('/api/app/resource/catalog?');
      expect(requestedPath).toContain('Category=Policies');
      expect(requestedPath).toContain('Filter=engineering');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.totalCount).toBe(2);
        expect(result.value.items).toHaveLength(2);
        expect(result.value.items[0]?.id).toBe('res-1');
        expect(result.value.items[0]?.canModify).toBe(true);
        expect(result.value.items[1]?.canModify).toBe(false);
      }
    });
  });

  describe('getById', () => {
    it('fetches a single resource by id', async () => {
      const client = makeHttpClient((path) => {
        if (path === '/api/app/resource/res-1/catalog-item') {
          return Promise.resolve(RESOURCE_ROW);
        }
        return Promise.reject(new Error(`Unexpected path: ${path}`));
      });

      const gateway = makeGateway(client);
      const result = await gateway.getById('res-1');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('res-1');
        expect(result.value.title).toBe('Engineering Guidelines');
      }
    });

    it('correctly maps Private (10) and Team (5) visibility', async () => {
      const client = makeHttpClient((path) => {
        if (path === '/api/app/resource/res-priv/catalog-item') {
          return Promise.resolve({ ...RESOURCE_ROW, id: 'res-priv', visibility: 10 });
        }
        if (path === '/api/app/resource/res-team/catalog-item') {
          return Promise.resolve({ ...RESOURCE_ROW, id: 'res-team', visibility: 5 });
        }
        return Promise.resolve({ ...RESOURCE_ROW, id: 'res-pub', visibility: 0 });
      });

      const gateway = makeGateway(client);

      const privateRes = await gateway.getById('res-priv');
      expect(isOk(privateRes)).toBe(true);
      if (isOk(privateRes)) {
        expect(privateRes.value.visibility).toBe('Private');
      }

      const teamRes = await gateway.getById('res-team');
      expect(isOk(teamRes)).toBe(true);
      if (isOk(teamRes)) {
        expect(teamRes.value.visibility).toBe('Team');
      }

      const publicRes = await gateway.getById('res-pub');
      expect(isOk(publicRes)).toBe(true);
      if (isOk(publicRes)) {
        expect(publicRes.value.visibility).toBe('Public');
      }
    });

    it('returns ResourceNotFoundError when resource does not exist (404)', async () => {
      const client = makeHttpClient(() =>
        Promise.reject(
          new HttpError({
            status: 404,
            statusText: 'Not Found',
            url: '/api/app/resource/missing-res/catalog-item',
            body: {},
            retryAfterMs: null,
          }),
        ),
      );

      const gateway = makeGateway(client);
      const result = await gateway.getById('missing-res');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('RESOURCES_NOT_FOUND');
      }
    });
  });

  describe('markHelpful', () => {
    it('posts to mark-helpful endpoint and returns updated resource', async () => {
      const postCalls: RecordedPost[] = [];
      const client = makeHttpClient(() => Promise.resolve(RESOURCE_ROW), postCalls);

      const gateway = makeGateway(client);
      const result = await gateway.markHelpful('res-1');

      expect(postCalls).toHaveLength(1);
      expect(postCalls[0]?.path).toBe('/api/app/resource/res-1/mark-helpful');
      expect(isOk(result)).toBe(true);
    });
  });

  describe('markComplete', () => {
    it('posts to mark-complete endpoint and returns updated resource', async () => {
      const postCalls: RecordedPost[] = [];
      const client = makeHttpClient(() => Promise.resolve(RESOURCE_ROW), postCalls);

      const gateway = makeGateway(client);
      const result = await gateway.markComplete('res-1');

      expect(postCalls).toHaveLength(1);
      expect(postCalls[0]?.path).toBe('/api/app/resource/res-1/mark-complete');
      expect(isOk(result)).toBe(true);
    });
  });

  describe('save', () => {
    it('puts updated resource to the API including category and categoryId', async () => {
      const putCalls: RecordedPut[] = [];
      const client = makeHttpClient(() => Promise.resolve(RESOURCE_ROW), [], putCalls);

      const gateway = makeGateway(client);
      const resource = buildResource({
        id: 'res-1',
        title: 'Engineering Guidelines',
        category: 'Policies & SOPs',
        categoryId: 'cat-42',
      });
      const result = await gateway.save(resource);

      expect(putCalls).toHaveLength(1);
      expect(putCalls[0]?.path).toBe('/api/app/resource/res-1');
      expect(putCalls[0]?.body).toEqual({
        title: 'Engineering Guidelines',
        description: '',
        slug: 'engineering-guidelines',
        status: 0,
        categoryId: 'cat-42',
        category: 'Policies & SOPs',
      });
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.categoryId).toBe('cat-42');
        expect(result.value.category).toBe('Policies & SOPs');
      }
    });
  });

  describe('remove', () => {
    it('issues delete request to the API', async () => {
      const deleteCalls: RecordedDelete[] = [];
      const client = makeHttpClient(
        () => Promise.resolve(undefined),
        [],
        [],
        deleteCalls,
      );

      const gateway = makeGateway(client);
      const result = await gateway.remove('res-1');

      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0]?.path).toBe('/api/app/resource/res-1');
      expect(isOk(result)).toBe(true);
    });
  });
});
