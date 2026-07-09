import { Announcement, type AnnouncementProps } from '@features/notifications/domain';

export type AnnouncementOverrides = Partial<AnnouncementProps>;

const DEFAULT_ANNOUNCEMENT: AnnouncementProps = {
  id: 'an-1',
  title: 'New Training Module Available',
  content: 'A new compliance module is available.',
  priority: 'high',
  author: 'Md Shamim',
  date: 'Jan 20, 2024',
  read: false,
};

export const buildAnnouncement = (overrides: AnnouncementOverrides = {}): Announcement =>
  new Announcement({ ...DEFAULT_ANNOUNCEMENT, ...overrides });
