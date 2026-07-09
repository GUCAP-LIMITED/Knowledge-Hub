import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  FolderOpen,
  HelpCircle,
  LayoutGrid,
  Play,
  PlayCircle,
  Star,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Badge, EmptyState, ProgressBar, StatCard, type StatTone } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Course } from '@features/courses';
import type { Announcement } from '@features/notifications';
import styles from './DashboardPage.module.css';

export type Role = 'admin' | 'manager' | 'consultant';
type Tone = 'primary' | 'secondary' | 'info' | 'warning';

export interface DashCtx {
  readonly pending: number;
  readonly coursesCount: number;
  readonly completedCount: number;
  readonly inProgressCount: number;
  readonly certCount: number;
  readonly submissionsCount: number;
  readonly publishedCount: number;
  readonly rejectedCount: number;
  readonly usersCount: number;
  readonly continueTitle: string | null;
}

interface QuickAction {
  readonly label: string;
  readonly desc: string;
  readonly icon: LucideIcon;
  readonly tone: Tone;
  readonly to: string;
}
interface Stat {
  readonly label: string;
  readonly value: string | number;
  readonly icon: LucideIcon;
  readonly tone: StatTone;
  readonly hint?: string;
}

export const buildActions = (role: Role, ctx: DashCtx): readonly QuickAction[] => {
  const learnTo = ctx.continueTitle !== null ? '/my-learning' : '/courses';
  if (role === 'admin') {
    return [
      {
        label: 'Review Queue',
        desc: `${String(ctx.pending)} items waiting`,
        icon: CheckCircle,
        tone: 'warning',
        to: '/approvals',
      },
      {
        label: 'Manage Content',
        desc: 'Edit and publish',
        icon: LayoutGrid,
        tone: 'info',
        to: '/content',
      },
      {
        label: 'Team Progress',
        desc: 'View team analytics',
        icon: BarChart3,
        tone: 'primary',
        to: '/team-progress',
      },
      {
        label: 'Course Reviews',
        desc: 'See all feedback',
        icon: Star,
        tone: 'secondary',
        to: '/course-reviews',
      },
    ];
  }
  if (role === 'manager') {
    return [
      {
        label: 'Continue Learning',
        desc: ctx.continueTitle ?? 'Browse catalog',
        icon: Play,
        tone: 'primary',
        to: learnTo,
      },
      {
        label: 'Upload Document',
        desc: 'Submit for review',
        icon: Upload,
        tone: 'secondary',
        to: '/upload',
      },
      {
        label: 'My Submissions',
        desc: 'Track status',
        icon: FileCheck,
        tone: 'info',
        to: '/submissions',
      },
      {
        label: 'Knowledge Base',
        desc: 'Browse resources',
        icon: FolderOpen,
        tone: 'primary',
        to: '/resources',
      },
    ];
  }
  return [
    {
      label: 'Resume Learning',
      desc: ctx.continueTitle ?? 'Browse catalog',
      icon: Play,
      tone: 'primary',
      to: learnTo,
    },
    {
      label: 'Browse Courses',
      desc: `${String(ctx.coursesCount)} available`,
      icon: PlayCircle,
      tone: 'secondary',
      to: '/courses',
    },
    {
      label: 'My Certificates',
      desc: `${String(ctx.certCount)} earned`,
      icon: Award,
      tone: 'warning',
      to: '/certificates',
    },
    {
      label: 'Resources',
      desc: 'Help & guides',
      icon: HelpCircle,
      tone: 'info',
      to: '/resources',
    },
  ];
};

export const buildStats = (role: Role, ctx: DashCtx): readonly Stat[] => {
  if (role === 'admin') {
    return [
      { label: 'Total Users', value: ctx.usersCount, icon: Users, tone: 'primary' },
      {
        label: 'Active Courses',
        value: ctx.coursesCount,
        icon: BookOpen,
        tone: 'success',
      },
      { label: 'Pending Reviews', value: ctx.pending, icon: FileCheck, tone: 'warning' },
      { label: 'Views (7d)', value: '1,240', icon: Eye, tone: 'info' },
    ];
  }
  if (role === 'manager') {
    return [
      {
        label: 'My Progress',
        value: ctx.inProgressCount,
        icon: BookOpen,
        tone: 'primary',
        hint: `${String(ctx.completedCount)} completed`,
      },
      {
        label: 'Submissions',
        value: ctx.submissionsCount,
        icon: Upload,
        tone: 'info',
        hint: `${String(ctx.pending)} pending`,
      },
      {
        label: 'Published',
        value: ctx.publishedCount,
        icon: CheckCircle,
        tone: 'success',
      },
      {
        label: 'Need Action',
        value: ctx.rejectedCount,
        icon: AlertCircle,
        tone: 'danger',
      },
    ];
  }
  return [
    { label: 'In Progress', value: ctx.inProgressCount, icon: BookOpen, tone: 'primary' },
    { label: 'Completed', value: ctx.completedCount, icon: CheckCircle, tone: 'success' },
    { label: 'Certificates', value: ctx.certCount, icon: Award, tone: 'secondary' },
    { label: 'Hours Logged', value: '47h', icon: Clock, tone: 'info' },
  ];
};

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
