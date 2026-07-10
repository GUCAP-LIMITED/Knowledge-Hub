import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BookOpen, CheckCircle, FileCheck, Play } from 'lucide-react';
import { Badge, EmptyState, ProgressBar, Skeleton } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Course } from '@features/courses';
import type { Announcement } from '@features/notifications';
import type { Submission } from '@features/submissions';
import styles from './DashboardPage.module.css';

const PANEL_HEAD_MS_PER_HOUR = 3_600_000;

const timeAgo = (date: Date): string => {
  const hours = Math.floor((Date.now() - date.getTime()) / PANEL_HEAD_MS_PER_HOUR);
  if (hours < 1) {
    return 'just now';
  }
  if (hours < 24) {
    return `${String(hours)}h ago`;
  }
  return `${String(Math.floor(hours / 24))}d ago`;
};

const PRIORITY_LABEL: Record<string, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  normal: 'Normal priority',
  low: 'Low priority',
};

/** Admin focal block: the submissions actually waiting on a decision. */
export const AttentionCard = ({
  pending,
}: {
  readonly pending: readonly Submission[];
}): ReactElement => (
  <div className={cn(styles.panel, styles.focal)}>
    <div className={styles.panelHead}>
      <h2 className={styles.panelTitle}>Needs your attention</h2>
      <Link to="/approvals" className={styles.viewAll}>
        View all
      </Link>
    </div>
    {pending.length === 0 ? (
      <EmptyState
        icon={CheckCircle}
        title="You're all caught up"
        description="No submissions are waiting for review right now."
      />
    ) : (
      <div className={styles.rows}>
        {pending.slice(0, 4).map((item) => (
          <div key={item.id} className={styles.attnRow}>
            <span className={styles.attnIcon}>
              <FileCheck size={18} aria-hidden="true" />
            </span>
            <span className={styles.attnBody}>
              <span className={styles.attnTitle}>{item.title}</span>
              <span className={styles.attnMeta}>
                {item.type} · by {item.submittedBy} · {timeAgo(item.submittedAt)}
              </span>
            </span>
            <Link to="/approvals" className={styles.attnAction}>
              Open
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const ContinueLearningCard = ({
  courses,
}: {
  readonly courses: readonly Course[];
}): ReactElement => (
  <div className={cn(styles.panel, styles.focal)}>
    <div className={styles.panelHead}>
      <h2 className={styles.panelTitle}>Continue Learning</h2>
      <Link to="/my-learning" className={styles.viewAll}>
        View all
      </Link>
    </div>
    {courses.length === 0 ? (
      <EmptyState
        icon={BookOpen}
        title="No courses in progress"
        description="Start a course from the catalog to see it here."
        action={
          <Link to="/courses" className={styles.attnAction}>
            Browse catalog
          </Link>
        }
      />
    ) : (
      <div className={styles.rows}>
        {courses.slice(0, 4).map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className={styles.courseRow}>
            <span className={styles.courseThumb}>
              <Play size={20} aria-hidden="true" />
            </span>
            <span className={styles.courseInfo}>
              <span className={styles.courseTitle}>{course.title}</span>
              <span className={styles.courseMeta}>
                {course.category} · {course.lessons} lessons · {course.progress}% complete
              </span>
              <ProgressBar value={course.progress} tone="auto" />
            </span>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export const AnnouncementsCard = ({
  announcements,
  unread,
  onMarkAll,
}: {
  readonly announcements: readonly Announcement[];
  readonly unread: number;
  readonly onMarkAll: () => void;
}): ReactElement => (
  <div className={styles.panel}>
    <div className={styles.panelHead}>
      <h2 className={styles.panelTitle}>
        Announcements{' '}
        {unread > 0 ? (
          <Badge tone="warning" size="sm">
            {unread} new
          </Badge>
        ) : null}
      </h2>
      {unread > 0 ? (
        <button type="button" className={styles.viewAll} onClick={onMarkAll}>
          Mark all read
        </button>
      ) : null}
    </div>
    {announcements.length === 0 ? (
      <EmptyState
        icon={Bell}
        title="No announcements"
        description="When something is announced, you'll see it here."
      />
    ) : (
      <div className={styles.announceRows}>
        {announcements.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className={cn(styles.announce, item.isUnread() && styles.announceUnread)}
          >
            <span
              className={cn(styles.announceDot, styles[`p_${item.priority}`])}
              role="img"
              aria-label={PRIORITY_LABEL[item.priority] ?? 'Announcement'}
            />
            <span className={styles.announceBody}>
              <span className={styles.announceTitle}>
                {item.title}{' '}
                {item.isUnread() ? (
                  <Badge tone="warning" size="sm">
                    New
                  </Badge>
                ) : null}
              </span>
              <span className={styles.announceText}>{item.content}</span>
              <span className={styles.announceMeta}>
                {item.author} · {item.date}
              </span>
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const PanelSkeleton = ({ rows = 3 }: { readonly rows?: number }): ReactElement => (
  <div className={styles.panel}>
    <Skeleton width="40%" height={16} />
    <div className={styles.skeletonRows}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} width="100%" height={56} radius={10} />
      ))}
    </div>
  </div>
);
