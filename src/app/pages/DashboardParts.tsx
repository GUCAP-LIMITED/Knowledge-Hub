import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { Badge, Button, EmptyState, ProgressBar, StatCard } from '@shared/ui';
import { cn } from '@shared/utils';
import { useCourseCategoryName, type Course } from '@features/courses';
import type { Announcement } from '@features/notifications';
import type { QuickAction, Stat } from './dashboard-data';
import styles from './DashboardPage.module.css';

export const WelcomeHero = ({
  name,
  firstName,
  subtitle,
  className,
}: {
  readonly name?: string | undefined;
  readonly firstName?: string | undefined;
  readonly subtitle: string;
  readonly className?: string | undefined;
}): ReactElement => {
  const displayName = name ?? firstName ?? 'there';
  return (
    <div className={cn(styles.hero, className)}>
      {/* <div className={styles.heroBlob} /> */}
      <div className={styles.heroEyebrow}>Academy</div>
      <h1 className={styles.heroTitle}>Welcome back, {displayName}</h1>
      <p className={styles.heroSubtitle}>{subtitle}</p>
    </div>
  );
};

export const QuickActions = ({
  actions,
  className,
}: {
  readonly actions: readonly QuickAction[];
  readonly className?: string | undefined;
}): ReactElement => (
  <div className={cn(styles.actions, className)}>
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

const ContinueLearningRow = ({ course }: { readonly course: Course }): ReactElement => {
  const categoryName = useCourseCategoryName(course.categoryId);

  return (
    <Link to={`/courses/${course.slug || course.id}`} className={styles.courseRow}>
      <span className={styles.courseThumb}>
        <PlayCircle size={22} aria-hidden="true" />
      </span>
      <span className={styles.courseInfo}>
        <span className={styles.courseTitle}>{course.title}</span>
        <span className={styles.courseMeta}>
          {categoryName ? `${categoryName} · ` : ''}
          {course.duration} · {course.progress}%
        </span>
        <ProgressBar value={course.progress} tone="auto" />
      </span>
    </Link>
  );
};

export const ContinueLearningCard = ({
  courses,
}: {
  readonly courses: readonly Course[];
}): ReactElement => (
  <div className={styles.panel}>
    <div className={styles.panelHead}>
      <h2 className={styles.panelTitle}>Continue Learning</h2>
      <Button asChild variant="link" size="sm">
        <Link to="/my-learning">View all</Link>
      </Button>
    </div>
    {courses.length === 0 ? (
      <EmptyState
        title="No courses in progress"
        description="Start a course from the catalog to see it here."
      />
    ) : (
      <div className={styles.rows}>
        {courses.slice(0, 4).map((course) => (
          <ContinueLearningRow key={course.id} course={course} />
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
        <Button variant="link" size="sm" onClick={onMarkAll}>
          Mark all read
        </Button>
      ) : null}
    </div>
    {announcements.length === 0 ? (
      <EmptyState
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
