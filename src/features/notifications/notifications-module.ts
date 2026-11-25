import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  GetNotificationStatsUseCase,
  ListAnnouncementsUseCase,
  MarkAllReadUseCase,
  MarkAnnouncementReadUseCase,
} from './application';
import { HttpNotificationGateway, InMemoryNotificationGateway } from './infrastructure';

export interface NotificationsModuleDeps {
  readonly httpClient?: HttpClient;
  readonly logger: Logger;
  readonly apiBaseUrl?: string;
}

export interface NotificationsModule {
  readonly listAnnouncements: ListAnnouncementsUseCase;
  readonly getNotificationStats: GetNotificationStatsUseCase;
  readonly markAnnouncementRead: MarkAnnouncementReadUseCase;
  readonly markAllRead: MarkAllReadUseCase;
  readonly apiBaseUrl?: string;
}

/** Composition root for the notifications feature. */
export const createNotificationsModule = (
  deps: NotificationsModuleDeps,
): NotificationsModule => {
  const notificationGateway = deps.httpClient
    ? new HttpNotificationGateway({ httpClient: deps.httpClient, logger: deps.logger })
    : new InMemoryNotificationGateway({ logger: deps.logger });
  const shared = { notificationGateway, logger: deps.logger };
  return {
    listAnnouncements: new ListAnnouncementsUseCase(shared),
    getNotificationStats: new GetNotificationStatsUseCase(shared),
    markAnnouncementRead: new MarkAnnouncementReadUseCase(shared),
    markAllRead: new MarkAllReadUseCase(shared),
    ...(deps.apiBaseUrl !== undefined ? { apiBaseUrl: deps.apiBaseUrl } : {}),
  };
};
