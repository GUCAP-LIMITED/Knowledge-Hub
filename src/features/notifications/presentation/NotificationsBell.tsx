import { useState, type ReactElement } from 'react';
import { Bell } from 'lucide-react';
import { Badge, IconButton, type BadgeTone } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Announcement, AnnouncementPriority } from '../domain';
import {
  useAnnouncements,
  useMarkAllRead,
  useMarkAnnouncementRead,
} from './use-notifications';
import styles from './NotificationsBell.module.css';

const priorityTone = (priority: AnnouncementPriority): BadgeTone => {
  if (priority === 'high') {
    return 'danger';
  }
  if (priority === 'medium') {
    return 'warning';
  }
  return priority === 'normal' ? 'info' : 'neutral';
};

const AnnouncementItem = ({
  announcement,
  onRead,
}: {
  readonly announcement: Announcement;
  readonly onRead: (id: string) => void;
}): ReactElement => (
  <button
    type="button"
    className={cn(styles.item, announcement.isUnread() && styles.unread)}
    onClick={() => {
      onRead(announcement.id);
    }}
  >
    <div className={styles.itemTop}>
      <span className={styles.itemTitle}>{announcement.title}</span>
      <Badge tone={priorityTone(announcement.priority)} size="sm">
        {announcement.priority}
      </Badge>
    </div>
    <p className={styles.itemContent}>{announcement.content}</p>
    <span className={styles.itemMeta}>
      {announcement.author} · {announcement.date}
    </span>
  </button>
);

/** Header notifications bell: unread count + a dismissible panel of announcements. */
export const NotificationsBell = (): ReactElement => {
  const announcements = useAnnouncements();
  const markRead = useMarkAnnouncementRead();
  const markAll = useMarkAllRead();
  const [open, setOpen] = useState(false);

  const list = announcements.data ?? [];
  const unread = list.filter((announcement) => announcement.isUnread()).length;

  return (
    <div className={styles.wrap}>
      <IconButton
        label="Notifications"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        <Bell size={18} />
        {unread > 0 ? <span className={styles.count}>{unread}</span> : null}
      </IconButton>
      {open ? (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close notifications"
            onClick={() => {
              setOpen(false);
            }}
          />
          <div className={styles.panel} role="dialog" aria-label="Notifications">
            <div className={styles.head}>
              <span className={styles.headTitle}>Notifications</span>
              {unread > 0 ? (
                <button
                  type="button"
                  className={styles.markAll}
                  onClick={() => {
                    markAll.mutate();
                  }}
                >
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className={styles.list}>
              {list.length === 0 ? (
                <p className={styles.empty}>You're all caught up.</p>
              ) : (
                list.map((announcement) => (
                  <AnnouncementItem
                    key={announcement.id}
                    announcement={announcement}
                    onRead={(id) => {
                      markRead.mutate(id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
