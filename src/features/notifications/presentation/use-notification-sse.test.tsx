import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { ToastContext, type ToastApi } from '@shared/ui';
import type { Announcement } from '../domain';
import { announcementsQueryKey } from './use-notifications';
import { NotificationsModuleContext } from './notifications-module-context';
import { useNotificationSse } from './use-notification-sse';
import type { NotificationsModule } from '../notifications-module';

let mockAuth = {
  isAuthenticated: false,
  accessToken: null as string | null,
};

vi.mock('@features/auth', () => ({
  useAuth: () => mockAuth,
}));

class FakeEventSource {
  public static instances: FakeEventSource[] = [];
  public url: string;
  public options?: EventSourceInit | undefined;
  public closed = false;
  public listeners: Record<string, ((event: MessageEvent<string>) => void)[]> = {};

  public constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    FakeEventSource.instances.push(this);
  }

  public addEventListener(
    type: string,
    listener: (event: MessageEvent<string>) => void,
  ): void {
    this.listeners[type] ??= [];
    this.listeners[type].push(listener);
  }

  public removeEventListener(
    type: string,
    listener: (event: MessageEvent<string>) => void,
  ): void {
    const list = this.listeners[type];
    if (list) {
      this.listeners[type] = list.filter((l) => l !== listener);
    }
  }

  public emit(type: string, data: string): void {
    const list = this.listeners[type];
    if (list) {
      for (const listener of list) {
        listener({ data } as MessageEvent<string>);
      }
    }
  }

  public close(): void {
    this.closed = true;
  }
}

describe('useNotificationSse', () => {
  let originalEventSource: typeof globalThis.EventSource;
  let queryClient: QueryClient;
  let mockToast: ToastApi;
  let mockModule: NotificationsModule;

  beforeEach(() => {
    originalEventSource = globalThis.EventSource;
    globalThis.EventSource = FakeEventSource as unknown as typeof globalThis.EventSource;
    FakeEventSource.instances = [];

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockToast = {
      push: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    mockModule = {
      listAnnouncements: {} as unknown as NotificationsModule['listAnnouncements'],
      getNotificationStats: {} as unknown as NotificationsModule['getNotificationStats'],
      markAnnouncementRead: {} as unknown as NotificationsModule['markAnnouncementRead'],
      markAllRead: {} as unknown as NotificationsModule['markAllRead'],
      apiBaseUrl: 'http://localhost:5080',
    };

    mockAuth = {
      isAuthenticated: false,
      accessToken: null,
    };
  });

  afterEach(() => {
    globalThis.EventSource = originalEventSource;
    vi.restoreAllMocks();
  });

  const createWrapper = () => {
    return function TestWrapper({
      children,
    }: {
      readonly children: ReactNode;
    }): ReactElement {
      return (
        <QueryClientProvider client={queryClient}>
          <ToastContext.Provider value={mockToast}>
            <NotificationsModuleContext.Provider value={mockModule}>
              {children}
            </NotificationsModuleContext.Provider>
          </ToastContext.Provider>
        </QueryClientProvider>
      );
    };
  };

  it('does not open an EventSource when the user is unauthenticated', () => {
    renderHook(
      () => {
        useNotificationSse();
      },
      { wrapper: createWrapper() },
    );

    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it('connects to SSE stream with auth token, credentials, and apiBaseUrl', () => {
    mockAuth = {
      isAuthenticated: true,
      accessToken: 'jwt-test-token-123',
    };

    renderHook(
      () => {
        useNotificationSse();
      },
      { wrapper: createWrapper() },
    );

    expect(FakeEventSource.instances).toHaveLength(1);
    const instance = FakeEventSource.instances[0];
    expect(instance?.url).toBe(
      'http://localhost:5080/api/app/notifications/stream?access_token=jwt-test-token-123',
    );
    expect(instance?.options).toEqual({ withCredentials: true });
  });

  it('updates query cache and displays toast on incoming notification event', () => {
    mockAuth = {
      isAuthenticated: true,
      accessToken: 'jwt-test-token-123',
    };

    renderHook(
      () => {
        useNotificationSse();
      },
      { wrapper: createWrapper() },
    );

    const instance = FakeEventSource.instances[0];
    expect(instance).toBeDefined();

    act(() => {
      instance?.emit(
        'notification',
        JSON.stringify({
          id: 'notif-1',
          title: 'Course Updated',
          message: 'A new lesson was added.',
          priorityName: 'high',
          creationTime: '2026-09-10T12:00:00Z',
        }),
      );
    });

    const cacheData =
      queryClient.getQueryData<readonly Announcement[]>(announcementsQueryKey);
    expect(cacheData).toHaveLength(1);
    expect(cacheData?.[0]?.id).toBe('notif-1');
    expect(cacheData?.[0]?.title).toBe('Course Updated');
    expect(cacheData?.[0]?.priority).toBe('high');

    expect(mockToast.info).toHaveBeenCalledWith(
      'Course Updated - A new lesson was added.',
    );
  });

  it('closes EventSource connection on unmount', () => {
    mockAuth = {
      isAuthenticated: true,
      accessToken: 'jwt-test-token-123',
    };

    const { unmount } = renderHook(
      () => {
        useNotificationSse();
      },
      { wrapper: createWrapper() },
    );

    const instance = FakeEventSource.instances[0];
    expect(instance?.closed).toBe(false);

    unmount();
    expect(instance?.closed).toBe(true);
  });
});
