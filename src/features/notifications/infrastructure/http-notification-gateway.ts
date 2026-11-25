import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { z } from 'zod';
import {
  Announcement,
  type AnnouncementPriority,
  type NotificationGateway,
  type NotificationError,
  type NotificationQueryParams,
  type NotificationStats,
  type PagedAnnouncementsResult,
  NotificationsUnavailableError,
  AnnouncementNotFoundError,
} from '../domain';

const BASE = '/api/app/notifications';

const NotificationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  priority: z.number().or(z.string()),
  priorityName: z.string().optional(),
  topicId: z.string().nullish(),
  extra: z.string().nullish(),
  isRead: z.boolean(),
  readTime: z.string().nullish(),
  creationTime: z.string(),
});

const PagedNotificationsSchema = z.object({
  totalCount: z.number(),
  items: z.array(NotificationItemSchema),
});

const NotificationStatsSchema = z.object({
  totalCount: z.number(),
  readCount: z.number(),
  unreadCount: z.number(),
});

export interface HttpNotificationGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

const mapPriority = (priorityName?: string): AnnouncementPriority => {
  const lower = (priorityName ?? '').toLowerCase();
  if (lower === 'high') return 'high';
  if (lower === 'medium') return 'medium';
  if (lower === 'low') return 'low';
  return 'normal';
};

const toAnnouncement = (item: z.infer<typeof NotificationItemSchema>): Announcement => {
  const formattedDate = new Date(item.creationTime).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return new Announcement({
    id: item.id,
    title: item.title,
    content: item.message,
    priority: mapPriority(item.priorityName),
    author: item.topicId ?? 'Academy',
    date: formattedDate,
    read: item.isRead,
    topicId: item.topicId ?? undefined,
    extra: item.extra ?? undefined,
  });
};

export class HttpNotificationGateway implements NotificationGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpNotificationGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('notification-gateway');
  }

  public async list(): Promise<Result<readonly Announcement[], NotificationError>> {
    const pagedResult = await this.listPaged({ maxResultCount: 50 });
    if (!pagedResult.ok) {
      return pagedResult;
    }
    return ok(pagedResult.value.items);
  }

  public async listPaged(
    params: NotificationQueryParams,
  ): Promise<Result<PagedAnnouncementsResult, NotificationError>> {
    try {
      const searchParams = new URLSearchParams();
      if (params.skipCount !== undefined) {
        searchParams.set('skipCount', String(params.skipCount));
      }
      if (params.maxResultCount !== undefined) {
        searchParams.set('maxResultCount', String(params.maxResultCount));
      }
      if (params.isRead !== undefined) {
        searchParams.set('isRead', String(params.isRead));
      }
      if (params.topicId) {
        searchParams.set('topicId', params.topicId);
      }
      if (params.sorting) {
        searchParams.set('sorting', params.sorting);
      }

      const queryString = searchParams.toString();
      const url = queryString ? `${BASE}?${queryString}` : BASE;
      const response = await this.httpClient.get<unknown>(url);
      const parsed = PagedNotificationsSchema.parse(response);

      return ok({
        items: parsed.items.map(toAnnouncement),
        totalCount: parsed.totalCount,
      });
    } catch (error) {
      this.logger.error('Failed to list notifications', { error, params });
      return err(new NotificationsUnavailableError(error));
    }
  }

  public async getStats(): Promise<Result<NotificationStats, NotificationError>> {
    try {
      const response = await this.httpClient.get<unknown>(`${BASE}/stats`);
      const parsed = NotificationStatsSchema.parse(response);
      return ok({
        totalCount: parsed.totalCount,
        readCount: parsed.readCount,
        unreadCount: parsed.unreadCount,
      });
    } catch (error) {
      this.logger.error('Failed to get notification stats', { error });
      return err(new NotificationsUnavailableError(error));
    }
  }

  public async markRead(id: string): Promise<Result<Announcement, NotificationError>> {
    try {
      const response = await this.httpClient.put<unknown>(`${BASE}/${id}/read`, {});
      const parsed = NotificationItemSchema.parse(response);
      return ok(toAnnouncement(parsed));
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return err(new AnnouncementNotFoundError(id));
      }
      this.logger.error('Failed to mark notification as read', { id, error });
      return err(new NotificationsUnavailableError(error));
    }
  }

  public async markAllRead(): Promise<
    Result<readonly Announcement[], NotificationError>
  > {
    try {
      await this.httpClient.post<unknown>(`${BASE}/mark-all-as-read`, {});
      return await this.list();
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read', { error });
      return err(new NotificationsUnavailableError(error));
    }
  }
}
