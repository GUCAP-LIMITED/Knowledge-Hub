import { useCallback, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Badge, Button, EmptyState } from '@shared/ui';
import { cn } from '@shared/utils';
import {
  useMarkAnnouncementRead,
  useMarkAllRead,
  formatNotificationTopic,
} from '@features/notifications';
import type { WidgetData, WidgetPoint } from '../../../domain';
import styles from './WidgetViews.module.css';

interface NotificationMeta {
  readonly id?: string | undefined;
  readonly message?: string | undefined;
  readonly priority?: string | undefined;
  readonly priorityName?: string | undefined;
  readonly topicId?: string | undefined;
  readonly extra?: string | undefined;
  readonly isRead?: string | boolean | undefined;
  readonly readTime?: string | undefined;
  readonly creationTime?: string | undefined;
}

interface NotificationSummary {
  readonly periodTotal?: number | undefined;
  readonly periodUnread?: number | undefined;
  readonly totalUnread?: number | undefined;
}

function stringOrUndefined(val: unknown): string | undefined {
  return typeof val === 'string' ? val : undefined;
}

function parseMeta(raw: string | null): NotificationMeta {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const isReadVal =
      typeof parsed.isRead === 'boolean'
        ? parsed.isRead
        : stringOrUndefined(parsed.isRead);

    return {
      id: stringOrUndefined(parsed.id),
      message: stringOrUndefined(parsed.message),
      priority: stringOrUndefined(parsed.priority),
      priorityName: stringOrUndefined(parsed.priorityName),
      topicId: stringOrUndefined(parsed.topicId),
      extra: stringOrUndefined(parsed.extra),
      isRead: isReadVal,
      readTime: stringOrUndefined(parsed.readTime),
      creationTime: stringOrUndefined(parsed.creationTime),
    };
  } catch {
    return { message: raw };
  }
}

function parseSummary(raw: string | null): NotificationSummary {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as NotificationSummary;
  } catch {
    return {};
  }
}

function isItemUnread(meta: NotificationMeta): boolean {
  if (meta.isRead === 'false' || meta.isRead === false) return true;
  if (meta.isRead === 'true' || meta.isRead === true) return false;
  return meta.readTime === undefined || meta.readTime.length === 0;
}

function getPriorityDotClass(priority: string | undefined, val: number): string {
  const p = (priority ?? '').toLowerCase();
  if (p === 'high' || p === 'urgent' || val >= 20) return styles.dotHigh ?? '';
  if (p === 'medium' || val === 15) return styles.dotMedium ?? '';
  return styles.dotNormal ?? '';
}

function formatNotificationTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function parseDeepLink(extra?: string): string | null {
  if (!extra) return null;
  try {
    const parsed = JSON.parse(extra) as { readonly route?: unknown };
    return typeof parsed.route === 'string' ? parsed.route : null;
  } catch {
    return null;
  }
}

interface NotificationRowProps {
  readonly point: WidgetPoint;
  readonly onItemClick: (meta: NotificationMeta) => void;
}

const NotificationRow = ({ point, onItemClick }: NotificationRowProps): ReactElement => {
  const meta = parseMeta(point.meta);
  const unread = isItemUnread(meta);
  const dotClass = getPriorityDotClass(meta.priority ?? meta.priorityName, point.value);
  const timeStr = formatNotificationTime(meta.creationTime);
  const topics = meta.topicId
    ? meta.topicId
        .split(',')
        .map((t) => formatNotificationTopic(t.trim()))
        .filter(Boolean)
    : [];

  return (
    <button
      type="button"
      className={cn(styles.notificationRow, unread && styles.notificationUnread)}
      onClick={() => {
        onItemClick(meta);
      }}
    >
      <span className={cn(styles.notificationDot, dotClass)} />
      <span className={styles.notificationBody}>
        <span className={styles.notificationTitleRow}>
          <span className={styles.notificationTitle}>{point.label}</span>
          {unread ? (
            <Badge tone="warning" size="sm">
              New
            </Badge>
          ) : null}
        </span>
        {meta.message ? (
          <span className={styles.notificationMessage}>{meta.message}</span>
        ) : null}
        <span className={styles.notificationMeta}>
          {timeStr ? <span>{timeStr}</span> : null}
          {topics.map((topic) => (
            <Badge key={topic} tone="neutral" size="sm">
              {topic}
            </Badge>
          ))}
        </span>
      </span>
    </button>
  );
};

export const NotificationsRecentWidgetView = ({
  data,
}: {
  readonly data: WidgetData;
}): ReactElement => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const markRead = useMarkAnnouncementRead();
  const markAll = useMarkAllRead();

  const points = data.series;
  const summary = parseSummary(data.summary);
  const unreadFromList = points.filter((p) => isItemUnread(parseMeta(p.meta))).length;
  const unreadCount =
    unreadFromList > 0
      ? unreadFromList
      : (summary.periodUnread ?? summary.totalUnread ?? 0);

  const invalidateWidgetData = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: ['dashboard', 'widget'] });
  }, [queryClient]);

  const handleMarkAll = (): void => {
    markAll.mutate(undefined, {
      onSuccess: invalidateWidgetData,
    });
  };

  const handleItemClick = (meta: NotificationMeta): void => {
    if (meta.id && isItemUnread(meta)) {
      markRead.mutate(meta.id, {
        onSuccess: invalidateWidgetData,
      });
    }
    const route = parseDeepLink(meta.extra);
    if (route) {
      navigate(route);
    }
  };

  if (points.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="When something is announced or notified, you'll see it here."
      />
    );
  }

  return (
    <div className={styles.notificationsContainer}>
      {unreadCount > 0 ? (
        <div className={styles.notificationsHead}>
          <Badge tone="warning" size="sm">
            {unreadCount} new
          </Badge>
          <Button
            variant="link"
            size="xs"
            onClick={handleMarkAll}
            disabled={markAll.isPending}
          >
            {markAll.isPending ? 'Marking...' : 'Mark all read'}
          </Button>
        </div>
      ) : null}

      <div className={styles.notificationsList}>
        {points.map((point, index) => {
          const meta = parseMeta(point.meta);
          return (
            <NotificationRow
              key={meta.id ?? `${point.label}-${String(index)}`}
              point={point}
              onItemClick={handleItemClick}
            />
          );
        })}
      </div>
    </div>
  );
};
