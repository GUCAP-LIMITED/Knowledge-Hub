import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bell, PlayCircle } from 'lucide-react';
import { Badge, EmptyState, ProgressBar, StatCard } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Course } from '@features/courses';
import type { Announcement } from '@features/notifications';
import type { QuickAction, Stat } from './dashboard-data';
import styles from './DashboardPage.module.css';

export const WelcomeHero = ({
  firstName,
  subtitle,
}: {
  readonly firstName: string;
  readonly subtitle: string;
}): ReactElement => (
  <div className={styles.hero}>
    <div className={styles.heroBlob} />
    <div className={styles.heroEyebrow}>Knowledge Hub</div>
    <h1 className={styles.heroTitle}>Welcome back, {firstName}</h1>
    <p className={styles.heroSubtitle}>{subtitle}</p>
  </div>
);

export const QuickActions = ({
  actions,
}: {
  readonly actions: readonly QuickAction[];
}): ReactElement => (
  <div className={styles.actions}>
    {actions.map((action) => {
      const Icon = action.icon;
      return (
        <Link key={action.label} to={action.to} className={styles.action}>
          <span className={cn(styles.actionIcon, styles[action.tone])}>
            <Icon size={18} aria-hidden="true" />
          </span>
          <span className={styles.actionText}>
            <span className={styles.actionLabel}>{action.label}</span>
            <span className={styles.actionDesc}>{action.desc}</span>
          </span>
        </Link>
      );
    })}
  </div>
);

export const StatsGrid = ({
  stats,
}: {
  readonly stats: readonly Stat[];
}): ReactElement => (
  <div className={styles.stats}>
    {stats.map((stat) => (
      <StatCard
        key={stat.label}
        label={stat.label}
        value={stat.value}
        icon={stat.icon}
        tone={stat.tone}
        {...(stat.hint !== undefined ? { hint: stat.hint } : {})}
        {...(stat.trend !== undefined ? { trend: stat.trend } : {})}
      />
    ))}
  </div>
);

export const ContinueLearningCard = ({
  courses,
}: {
  readonly courses: readonly Course[];
}): ReactElement => (
  <div className={styles.panel}>
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
      />
    ) : (
      <div className={styles.rows}>
        {courses.slice(0, 4).map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className={styles.courseRow}>
            <span className={styles.courseThumb}>
              <PlayCircle size={22} aria-hidden="true" />
            </span>
            <span className={styles.courseInfo}>
              <span className={styles.courseTitle}>{course.title}</span>
              <span className={styles.courseMeta}>
                {course.category} · {course.duration} · {course.progress}%
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
            <span className={cn(styles.announceDot, styles[`p_${item.priority}`])} />
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
