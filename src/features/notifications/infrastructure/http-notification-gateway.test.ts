import { describe, expect, it } from 'vitest';
import { type HttpClient, HttpError } from '@core/http';
import { isErr, isOk } from '@core/result';
import { silentLogger } from '@testing';
import { HttpNotificationGateway } from './http-notification-gateway';

const notImplemented = (): never => {
  throw new Error('not used in this test');
};

const SAMPLE_SERVER_NOTIFICATION = {
  id: 'notif-1',
  title: 'System Update',
  message: 'Maintenance scheduled tonight.',
  priority: 1,
  priorityName: 'High',
  topicId: 'Engineering',
  extra: 'extra-data',
  isRead: false,
  readTime: null,
  creationTime: '2026-09-01T10:00:00Z',
};

describe('HttpNotificationGateway', () => {
  describe('list', () => {
    it('fetches notifications with maxResultCount=50 and maps response to announcements', async () => {
      let requestedPath = '';
      const httpClient: HttpClient = {
        get: <TResponse>(path: string): Promise<TResponse> => {
          requestedPath = path;
          return Promise.resolve({
            totalCount: 1,
            items: [SAMPLE_SERVER_NOTIFICATION],
          }) as Promise<TResponse>;
        },
        post: notImplemented,
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.list();

      expect(requestedPath).toBe('/api/app/notifications?maxResultCount=50');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(1);
        const item = result.value[0];
        expect(item?.id).toBe('notif-1');
        expect(item?.title).toBe('System Update');
        expect(item?.content).toBe('Maintenance scheduled tonight.');
        expect(item?.priority).toBe('high');
        expect(item?.author).toBe('Engineering');
        expect(item?.read).toBe(false);
        expect(item?.topicId).toBe('Engineering');
        expect(item?.extra).toBe('extra-data');
      }
    });

    it('falls back to "Academy" and "normal" priority when optional fields are omitted', async () => {
      const httpClient: HttpClient = {
        get: <TResponse>(): Promise<TResponse> =>
          Promise.resolve({
            totalCount: 1,
            items: [
              {
                id: 'notif-2',
                title: 'Welcome',
                message: 'Welcome to the platform',
                priority: 0,
                isRead: true,
                creationTime: '2026-09-02T12:00:00Z',
              },
            ],
          }) as Promise<TResponse>,
        post: notImplemented,
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.list();

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value[0]?.author).toBe('Academy');
        expect(result.value[0]?.priority).toBe('normal');
        expect(result.value[0]?.read).toBe(true);
      }
    });

    it('returns NotificationsUnavailableError on network failure or malformed payload', async () => {
      const httpClient: HttpClient = {
        get: (): Promise<never> => Promise.reject(new Error('Network error')),
        post: notImplemented,
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.list();

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('NOTIFICATIONS_UNAVAILABLE');
      }
    });
  });

  describe('markRead', () => {
    it('sends PUT to /{id}/read and returns mapped announcement', async () => {
      let putPath = '';
      let putBody: unknown = null;
      const httpClient: HttpClient = {
        get: notImplemented,
        post: notImplemented,
        put: <TResponse>(path: string, body?: unknown): Promise<TResponse> => {
          putPath = path;
          putBody = body;
          return Promise.resolve({
            ...SAMPLE_SERVER_NOTIFICATION,
            isRead: true,
          }) as Promise<TResponse>;
        },
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.markRead('notif-1');

      expect(putPath).toBe('/api/app/notifications/notif-1/read');
      expect(putBody).toEqual({});
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('notif-1');
        expect(result.value.read).toBe(true);
      }
    });

    it('returns AnnouncementNotFoundError when the notification does not exist (404)', async () => {
      const httpClient: HttpClient = {
        get: notImplemented,
        post: notImplemented,
        put: (): Promise<never> =>
          Promise.reject(
            new HttpError({
              status: 404,
              statusText: 'Not Found',
              url: '/api/app/notifications/missing/read',
              body: null,
              retryAfterMs: null,
            }),
          ),
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.markRead('missing');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('NOTIFICATIONS_NOT_FOUND');
      }
    });

    it('returns NotificationsUnavailableError on other unexpected HTTP errors', async () => {
      const httpClient: HttpClient = {
        get: notImplemented,
        post: notImplemented,
        put: (): Promise<never> =>
          Promise.reject(
            new HttpError({
              status: 500,
              statusText: 'Internal Server Error',
              url: '/api/app/notifications/notif-1/read',
              body: null,
              retryAfterMs: null,
            }),
          ),
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.markRead('notif-1');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('NOTIFICATIONS_UNAVAILABLE');
      }
    });
  });

  describe('markAllRead', () => {
    it('posts to mark-all-as-read and re-fetches the updated list', async () => {
      let postPath = '';
      let postBody: unknown = null;
      let getCallCount = 0;

      const httpClient: HttpClient = {
        get: <TResponse>(): Promise<TResponse> => {
          getCallCount += 1;
          return Promise.resolve({
            totalCount: 1,
            items: [{ ...SAMPLE_SERVER_NOTIFICATION, isRead: true }],
          }) as Promise<TResponse>;
        },
        post: <TResponse>(path: string, body?: unknown): Promise<TResponse> => {
          postPath = path;
          postBody = body;
          return Promise.resolve(1) as Promise<TResponse>;
        },
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.markAllRead();

      expect(postPath).toBe('/api/app/notifications/mark-all-as-read');
      expect(postBody).toEqual({});
      expect(getCallCount).toBe(1);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value[0]?.read).toBe(true);
      }
    });

    it('returns NotificationsUnavailableError when posting to mark-all-as-read fails', async () => {
      const httpClient: HttpClient = {
        get: notImplemented,
        post: (): Promise<never> => Promise.reject(new Error('Server unavailable')),
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.markAllRead();

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('NOTIFICATIONS_UNAVAILABLE');
      }
    });
  });

  describe('listPaged', () => {
    it('constructs correct query parameters and returns items with totalCount', async () => {
      let requestedPath = '';
      const httpClient: HttpClient = {
        get: <TResponse>(path: string): Promise<TResponse> => {
          requestedPath = path;
          return Promise.resolve({
            totalCount: 42,
            items: [SAMPLE_SERVER_NOTIFICATION],
          }) as Promise<TResponse>;
        },
        post: notImplemented,
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.listPaged({
        skipCount: 15,
        maxResultCount: 15,
        isRead: false,
        sorting: 'CreationTime DESC',
      });

      expect(requestedPath).toBe(
        '/api/app/notifications?skipCount=15&maxResultCount=15&isRead=false&sorting=CreationTime+DESC',
      );
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.totalCount).toBe(42);
        expect(result.value.items).toHaveLength(1);
        expect(result.value.items[0]?.id).toBe('notif-1');
      }
    });

    it('returns NotificationsUnavailableError on HTTP failure', async () => {
      const httpClient: HttpClient = {
        get: (): Promise<never> => Promise.reject(new Error('Network error')),
        post: notImplemented,
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.listPaged({ skipCount: 0, maxResultCount: 15 });
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('NOTIFICATIONS_UNAVAILABLE');
      }
    });
  });

  describe('getStats', () => {
    it('fetches /stats and maps total, read, and unread counts', async () => {
      let requestedPath = '';
      const httpClient: HttpClient = {
        get: <TResponse>(path: string): Promise<TResponse> => {
          requestedPath = path;
          return Promise.resolve({
            totalCount: 10,
            readCount: 8,
            unreadCount: 2,
          }) as Promise<TResponse>;
        },
        post: notImplemented,
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.getStats();

      expect(requestedPath).toBe('/api/app/notifications/stats');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.totalCount).toBe(10);
        expect(result.value.readCount).toBe(8);
        expect(result.value.unreadCount).toBe(2);
      }
    });

    it('returns NotificationsUnavailableError when fetching stats fails', async () => {
      const httpClient: HttpClient = {
        get: (): Promise<never> => Promise.reject(new Error('Timeout')),
        post: notImplemented,
        put: notImplemented,
        patch: notImplemented,
        delete: notImplemented,
        postForm: notImplemented,
      };

      const gateway = new HttpNotificationGateway({
        httpClient,
        logger: silentLogger(),
      });

      const result = await gateway.getStats();
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('NOTIFICATIONS_UNAVAILABLE');
      }
    });
  });
});
