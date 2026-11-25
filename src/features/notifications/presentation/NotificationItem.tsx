import type { ReactElement, MouseEvent, KeyboardEvent } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Badge, Button, type BadgeTone } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Announcement, AnnouncementAction, AnnouncementPriority } from '../domain';
import styles from './NotificationsBell.module.css';

export interface NotificationItemProps {
  readonly announcement: Announcement;
  readonly onRead: (id: string) => void;
  readonly onNavigate?: (route: string) => void;
}

type CategoryTone = 'success' | 'danger' | 'warning' | 'info' | 'primary';

interface CategoryConfig {
  readonly icon: typeof Bell;
  readonly tone: CategoryTone;
}

const SUCCESS_KEYWORDS = [
  'approved',
  'published',
  'completed',
  'congratulations',
] as const;
const DANGER_KEYWORDS = [
  'changes requested',
  'rejected',
  'overdue',
  'urgent',
  'due tomorrow',
  'compliance alert',
] as const;
const MODERATION_KEYWORDS = ['review', 'submission', 'contentmoderation'] as const;
const LEARNING_KEYWORDS = ['assignment', 'training', 'course'] as const;

const hasAnyKeyword = (text: string, words: readonly string[]): boolean =>
  words.some((word) => text.includes(word));

const resolveCategory = (
  title: string,
  topicId?: string,
  priority?: AnnouncementPriority,
): CategoryConfig => {
  if (priority === 'high') {
    return { icon: AlertCircle, tone: 'danger' };
  }
  const text = `${title} ${topicId ?? ''}`.toLowerCase();
  if (hasAnyKeyword(text, SUCCESS_KEYWORDS)) {
    return { icon: CheckCircle2, tone: 'success' };
  }
  if (hasAnyKeyword(text, DANGER_KEYWORDS)) {
    return { icon: AlertCircle, tone: 'danger' };
  }
  if (hasAnyKeyword(text, MODERATION_KEYWORDS)) {
    return { icon: BookOpen, tone: 'warning' };
  }
  if (hasAnyKeyword(text, LEARNING_KEYWORDS)) {
    return { icon: GraduationCap, tone: 'primary' };
  }
  return { icon: Bell, tone: 'info' };
};

const priorityTone = (priority: AnnouncementPriority): BadgeTone => {
  if (priority === 'high') return 'danger';
  if (priority === 'medium') return 'warning';
  if (priority === 'normal') return 'info';
  return 'neutral';
};

const PriorityBadge = ({
  priority,
}: {
  readonly priority?: AnnouncementPriority;
}): ReactElement | null => {
  if (!priority) return null;
  return (
    <Badge tone={priorityTone(priority)} size="sm">
      {priority}
    </Badge>
  );
};

const ActionButton = ({
  action,
  onClick,
}: {
  readonly action: AnnouncementAction;
  readonly onClick: (e: MouseEvent) => void;
}): ReactElement => (
  <div className={styles.actionRow}>
    <Button variant="secondary" size="xs" onClick={onClick}>
      <span>{action.actionText}</span>
      <ChevronRight aria-hidden="true" />
    </Button>
  </div>
);

export const NotificationItem = ({
  announcement,
  onRead,
  onNavigate,
}: NotificationItemProps): ReactElement => {
  const action = announcement.getAction();
  const unread = announcement.isUnread();
  const category = resolveCategory(
    announcement.title,
    announcement.topicId,
    announcement.priority,
  );
  const IconComponent = category.icon;

  const handleClick = (): void => {
    onRead(announcement.id);
    if (action?.route && onNavigate) {
      onNavigate(action.route);
    }
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const formattedTopic = announcement.getFormattedTopic();
  const showAuthor =
    Boolean(announcement.author) &&
    announcement.author.trim().toLowerCase() !==
      (announcement.topicId ?? '').trim().toLowerCase();

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(styles.item, unread && styles.unread)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(styles.iconWrapper, styles[`icon_${category.tone}`])}
        aria-hidden="true"
      >
        <IconComponent size={16} />
      </div>

      <div className={styles.itemBody}>
        <div className={styles.itemHeader}>
          <div className={styles.itemMetaLeft}>
            {announcement.topicId ? (
              <span className={styles.topicBadge}>{formattedTopic}</span>
            ) : null}
            <span className={styles.itemDate}>
              {showAuthor ? `${announcement.author} · ` : ''}
              {announcement.date}
            </span>
          </div>
          <div className={styles.itemMetaRight}>
            <PriorityBadge priority={announcement.priority} />
            {unread ? (
              <span className={styles.unreadDot} aria-label="Unread notification" />
            ) : null}
          </div>
        </div>

        <div className={styles.itemTitle}>{announcement.title}</div>
        <p className={styles.itemContent}>{announcement.content}</p>

        {action ? (
          <ActionButton
            action={action}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
