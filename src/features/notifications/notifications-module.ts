import type { Logger } from '@core/logger';
import {
  ListAnnouncementsUseCase,
  MarkAllReadUseCase,
  MarkAnnouncementReadUseCase,
} from './application';
import { InMemoryNotificationGateway } from './infrastructure';

export interface NotificationsModuleDeps {
  readonly logger: Logger;
}

export interface NotificationsModule {
  readonly listAnnouncements: ListAnnouncementsUseCase;
  readonly markAnnouncementRead: MarkAnnouncementReadUseCase;
  readonly markAllRead: MarkAllReadUseCase;
}

/** Composition root for the notifications feature. */
export const createNotificationsModule = (
  deps: NotificationsModuleDeps,
): NotificationsModule => {
  const notificationGateway = new InMemoryNotificationGateway({ logger: deps.logger });
  const shared = { notificationGateway, logger: deps.logger };
  return {
    listAnnouncements: new ListAnnouncementsUseCase(shared),
    markAnnouncementRead: new MarkAnnouncementReadUseCase(shared),
    markAllRead: new MarkAllReadUseCase(shared),
  };
};
