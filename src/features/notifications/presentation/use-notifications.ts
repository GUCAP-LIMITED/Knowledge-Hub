import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type {
  Announcement,
  NotificationStats,
  PagedAnnouncementsResult,
} from '../domain';
import { useNotificationsModule } from './use-notifications-module';

export const announcementsQueryKey = ['notifications'] as const;

export const notificationKeys = {
  all: ['notifications'] as const,
  stats: () => ['notifications', 'stats'] as const,
  infinite: (filter: 'all' | 'unread') => ['notifications', 'infinite', filter] as const,
};

/**
 * Fetches legacy unpaginated announcements (backward compatible).
 */
export const useAnnouncements = (): UseQueryResult<readonly Announcement[]> => {
  const { listAnnouncements } = useNotificationsModule();
  return useQuery({
    queryKey: announcementsQueryKey,
    queryFn: async (): Promise<readonly Announcement[]> => {
      const result = await listAnnouncements.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/**
 * Fetches aggregated notification statistics (total, read, unread) from the server.
 */
export const useNotificationStats = (): UseQueryResult<NotificationStats> => {
  const { getNotificationStats } = useNotificationsModule();
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: async (): Promise<NotificationStats> => {
      const result = await getNotificationStats.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 1000 * 30,
  });
};

/**
 * Database-level paginated infinite query for notifications.
 */
export const useInfiniteNotifications = (
  filter: 'all' | 'unread',
  options?: { readonly enabled?: boolean; readonly pageSize?: number },
): UseInfiniteQueryResult<InfiniteData<PagedAnnouncementsResult>> => {
  const { listAnnouncements } = useNotificationsModule();
  const pageSize = options?.pageSize ?? 15;

  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(filter),
    queryFn: async ({ pageParam }): Promise<PagedAnnouncementsResult> => {
      const result = await listAnnouncements.executePaged({
        skipCount: pageParam,
        maxResultCount: pageSize,
        isRead: filter === 'unread' ? false : undefined,
        sorting: 'CreationTime DESC',
      });
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: PagedAnnouncementsResult,
      allPages: readonly PagedAnnouncementsResult[],
    ): number | undefined => {
      const loadedCount = allPages.reduce((total, page) => total + page.items.length, 0);
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 30,
    enabled: options?.enabled ?? true,
  });
};

const useInvalidateNotifications = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  };
};

export const useMarkAnnouncementRead = (): UseMutationResult<
  Announcement,
  Error,
  string
> => {
  const { markAnnouncementRead } = useNotificationsModule();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateNotifications();

  return useMutation({
    mutationFn: async (id: string): Promise<Announcement> => {
      const result = await markAnnouncementRead.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (updatedAnnouncement) => {
      // Optimistically update stats cache
      queryClient.setQueryData<NotificationStats>(notificationKeys.stats(), (old) => {
        if (!old) return old;
        const unread = Math.max(0, old.unreadCount - 1);
        return {
          totalCount: old.totalCount,
          readCount: old.readCount + 1,
          unreadCount: unread,
        };
      });

      // Update item in infinite query cache for 'all'
      queryClient.setQueryData<InfiniteData<PagedAnnouncementsResult>>(
        notificationKeys.infinite('all'),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === updatedAnnouncement.id ? updatedAnnouncement : item,
              ),
            })),
          };
        },
      );

      // Invalidate queries to ensure fresh sync
      invalidate();
    },
  });
};

export const useMarkAllRead = (): UseMutationResult<
  readonly Announcement[],
  Error,
  void
> => {
  const { markAllRead } = useNotificationsModule();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateNotifications();

  return useMutation({
    mutationFn: async (): Promise<readonly Announcement[]> => {
      const result = await markAllRead.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      // Optimistically zero out unread stats
      queryClient.setQueryData<NotificationStats>(notificationKeys.stats(), (old) => {
        if (!old) return old;
        return {
          totalCount: old.totalCount,
          readCount: old.totalCount,
          unreadCount: 0,
        };
      });

      invalidate();
    },
  });
};
