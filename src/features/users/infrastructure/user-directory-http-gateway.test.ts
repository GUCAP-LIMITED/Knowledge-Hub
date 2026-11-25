import { describe, expect, it } from 'vitest';
import type { HttpClient, RequestOptions } from '@core/http';
import { silentLogger } from '@testing/fakes/silent-logger';
import { UserDirectoryHttpGateway } from './user-directory-http-gateway';

const TOTAL = 5;
const noFilter = { branchId: null, userTypeId: null };

const dto = (index: number): unknown => ({
  userId: `u${String(index)}`,
  userName: null,
  name: `User ${String(index)}`,
  email: null,
  isActive: true,
  userTypes: [],
  branches: [],
  profileImageUrl: null,
});

/** Fake server that honours SkipCount but caps every page at `serverCap` items. */
const makeClient = (
  serverCap: number,
  queries: Record<string, unknown>[],
): HttpClient => {
  const notUsed = (): never => {
    throw new Error('not used in this test');
  };
  return {
    get: <T>(_path: string, options?: RequestOptions): Promise<T> => {
      const query = (options?.query ?? {}) as Record<string, number>;
      queries.push(query);
      const skip = query.SkipCount ?? 0;
      const take = Math.min(query.MaxResultCount ?? serverCap, serverCap);
      const items = Array.from({ length: TOTAL }, (_, i) => dto(i)).slice(
        skip,
        skip + take,
      );
      return Promise.resolve({ totalCount: TOTAL, items } as T);
    },
    post: notUsed,
    put: notUsed,
    patch: notUsed,
    delete: notUsed,
    postForm: notUsed,
  };
};

describe('UserDirectoryHttpGateway paging', () => {
  it('requests the page offset and size for a single page', async () => {
    const queries: Record<string, unknown>[] = [];
    const gateway = new UserDirectoryHttpGateway({
      httpClient: makeClient(100, queries),
      logger: silentLogger(),
    });

    const page = await gateway.listUsersPage(noFilter, 1, 2);

    expect(page.totalCount).toBe(TOTAL);
    expect(page.items.map((u) => u.userId)).toEqual(['u2', 'u3']);
    expect(queries[0]).toMatchObject({ SkipCount: 2, MaxResultCount: 2 });
  });

  it('listUsers walks every page even when the server caps the page size', async () => {
    const queries: Record<string, unknown>[] = [];
    const gateway = new UserDirectoryHttpGateway({
      httpClient: makeClient(2, queries),
      logger: silentLogger(),
    });

    const users = await gateway.listUsers(noFilter);

    expect(users.map((u) => u.userId)).toEqual(['u0', 'u1', 'u2', 'u3', 'u4']);
    expect(queries.map((q) => q.SkipCount)).toEqual([0, 2, 4]);
  });

  it('listBranches queries /api/app/branch/my and maps items', async () => {
    let requestedPath = '';
    const notUsed = (): never => {
      throw new Error('not used in this test');
    };
    const httpClient: HttpClient = {
      get: <T>(path: string): Promise<T> => {
        requestedPath = path;
        return Promise.resolve({
          totalCount: 2,
          totalUserCount: 10,
          items: [
            { id: 'b-1', name: 'Dhaka HQ' },
            { id: 'b-2', name: 'London Office' },
          ],
        } as T);
      },
      post: notUsed,
      put: notUsed,
      patch: notUsed,
      delete: notUsed,
      postForm: notUsed,
    };

    const gateway = new UserDirectoryHttpGateway({
      httpClient,
      logger: silentLogger(),
    });

    const branches = await gateway.listBranches();

    expect(requestedPath).toBe('/api/app/branch/my');
    expect(branches).toEqual([
      { id: 'b-1', name: 'Dhaka HQ' },
      { id: 'b-2', name: 'London Office' },
    ]);
  });
});
