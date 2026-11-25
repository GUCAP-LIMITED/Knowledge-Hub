import { useContext, useEffect, useRef } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuth } from '@features/auth';
import { ToastContext, type ToastApi } from '@shared/ui';
import {
  type AnnouncementPriority,
  Announcement,
  type NotificationStats,
} from '../domain';
import { announcementsQueryKey, notificationKeys } from './use-notifications';
import { openReconnectingStream } from './open-reconnecting-stream';
import { useNotificationsModule } from './use-notifications-module';

interface SseNotificationPayload {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly priority?: number;
  readonly priorityName?: string;
  readonly topicId?: string;
  readonly extra?: string;
  readonly isRead?: boolean;
  readonly creationTime?: string;
}

const mapPriority = (priorityName?: string): AnnouncementPriority => {
  const lower = (priorityName ?? '').toLowerCase();
  if (lower === 'high') return 'high';
  if (lower === 'medium') return 'medium';
  if (lower === 'low') return 'low';
  return 'normal';
};

const formatCreationDate = (creationTime?: string): string => {
  if (!creationTime) {
    return 'Just now';
  }
  return new Date(creationTime).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const invalidateContentQueries = (queryClient: QueryClient, topicId?: string): void => {
  if (topicId !== 'ContentSubmission' && topicId !== 'ContentModeration') {
    return;
  }
  void queryClient.invalidateQueries({ queryKey: ['review-queue'] });
  void queryClient.invalidateQueries({ queryKey: ['submissions'] });
  void queryClient.invalidateQueries({ queryKey: ['revisions'] });
  void queryClient.invalidateQueries({ queryKey: ['content'] });
  void queryClient.invalidateQueries({ queryKey: ['approval-status-counts'] });
  void queryClient.invalidateQueries({ queryKey: ['revision-status-counts'] });
};

const dispatchNotificationToast = (
  toast: ToastApi | null,
  priority: AnnouncementPriority,
  title: string,
  message: string,
): void => {
  if (!toast) {
    return;
  }
  const messageText = `${title}${message ? ` - ${message}` : ''}`;
  if (priority !== 'high') {
    toast.info(messageText);
    return;
  }
  const isNegative =
    title.includes('Rejected') ||
    title.includes('Changes Requested') ||
    title.includes('Action Required');
  if (isNegative) {
    toast.error(messageText);
    return;
  }
  const isPositive =
    title.includes('Approved') ||
    title.includes('Published') ||
    title.includes('🎉') ||
    title.includes('🚀');
  if (isPositive) {
    toast.success(messageText);
    return;
  }
  toast.info(messageText);
};

/**
 * Subscribes the current authenticated user to the backend Server-Sent Events (SSE) notification stream.
 * Automatically updates React Query announcements cache on real-time pushes, fires in-app toasts, and handles read-all events.
 */
export const useNotificationSse = (): void => {
  const { accessToken, isAuthenticated } = useAuth();
  const { apiBaseUrl } = useNotificationsModule();
  const toast = useContext(ToastContext);
  const queryClient = useQueryClient();

  // Token refreshes (~every 10 min) must not tear the stream down: read the latest token lazily.
  const tokenRef = useRef(accessToken);
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);
  // No `apiBaseUrl` means no live stream is configured (e.g. the offline mock backend).
  const hasToken = accessToken !== null && accessToken !== '' && apiBaseUrl !== undefined;

  useEffect(() => {
    if (!isAuthenticated || !hasToken || typeof EventSource === 'undefined') {
      return undefined;
    }

    const base = apiBaseUrl.replace(/\/+$/, '');
    const buildUrl = (): string =>
      `${base}/api/app/notifications/stream?access_token=${encodeURIComponent(tokenRef.current ?? '')}`;

    return openReconnectingStream(buildUrl, (eventSource) => {
      eventSource.addEventListener('notification', (event: MessageEvent<string>) => {
        try {
          const data = JSON.parse(event.data) as SseNotificationPayload;
          const formattedDate = formatCreationDate(data.creationTime);
          const priority = mapPriority(data.priorityName);

          const newAnnouncement = new Announcement({
            id: data.id,
            title: data.title,
            content: data.message,
            priority,
            author: data.topicId ?? 'Academy',
            date: formattedDate,
            read: data.isRead ?? false,
            topicId: data.topicId ?? undefined,
            extra: data.extra ?? undefined,
          });

          queryClient.setQueryData<readonly Announcement[]>(
            announcementsQueryKey,
            (old = []) => [
              newAnnouncement,
              ...old.filter((a) => a.id !== newAnnouncement.id),
            ],
          );

          // Optimistically update stats and invalidate lists
          queryClient.setQueryData<NotificationStats>(notificationKeys.stats(), (old) => {
            if (!old) return old;
            const isRead = data.isRead ?? false;
            const total = old.totalCount + 1;
            const read = isRead ? old.readCount + 1 : old.readCount;
            return {
              totalCount: total,
              readCount: read,
              unreadCount: Math.max(0, total - read),
            };
          });

          void queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
          void queryClient.invalidateQueries({ queryKey: ['notifications', 'infinite'] });

          invalidateContentQueries(queryClient, data.topicId);
          dispatchNotificationToast(toast, priority, data.title, data.message);
        } catch {
          // Ignore JSON parse errors on ping / non-standard frames
        }
      });

      eventSource.addEventListener('read-all', () => {
        queryClient.setQueryData<readonly Announcement[]>(
          announcementsQueryKey,
          (old = []) => old.map((a) => a.markRead()),
        );

        queryClient.setQueryData<NotificationStats>(notificationKeys.stats(), (old) => {
          if (!old) return old;
          return {
            totalCount: old.totalCount,
            readCount: old.totalCount,
            unreadCount: 0,
          };
        });

        void queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
        void queryClient.invalidateQueries({ queryKey: ['notifications', 'infinite'] });
      });
    });
  }, [apiBaseUrl, hasToken, isAuthenticated, queryClient, toast]);
};
