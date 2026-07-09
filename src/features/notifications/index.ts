/** Public API of the `notifications` feature: announcements + the header bell. */
export {
  createNotificationsModule,
  type NotificationsModule,
  type NotificationsModuleDeps,
} from './notifications-module';
export {
  NotificationsModuleProvider,
  NotificationsBell,
  useAnnouncements,
  useMarkAnnouncementRead,
  useMarkAllRead,
  announcementsQueryKey,
} from './presentation';
export { Announcement, type AnnouncementProps } from './domain';
