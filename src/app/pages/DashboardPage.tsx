import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle,
  Clock,
  CheckCircle,
  Award,
  Compass,
  FolderOpen,
  Star,
  FileCheck,
  ClipboardList,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  EmptyState,
  PageHeader,
  ProgressBar,
  Skeleton,
  StatCard,
} from '@shared/ui';
import { useAuth, type AuthenticatedUser } from '@features/auth';
import { useCourses, type Course } from '@features/courses';
import { useCertificates } from '@features/certificates';
import styles from './DashboardPage.module.css';

interface QuickAction {
  readonly to: string;
  readonly title: string;
  readonly desc: string;
  readonly icon: LucideIcon;
  readonly anyOf?: readonly string[];
}

const ACTIONS: readonly QuickAction[] = [
  {
    to: '/courses',
    title: 'Browse courses',
    desc: 'Explore the catalog',
    icon: PlayCircle,
  },
  { to: '/resources', title: 'Resources', desc: 'Guides & references', icon: FolderOpen },
  { to: '/certificates', title: 'Certificates', desc: 'Your credentials', icon: Award },
  { to: '/reviews', title: 'Reviews', desc: 'Share your feedback', icon: Star },
  {
    to: '/submissions',
    title: 'My Submissions',
    desc: 'Upload & track',
    icon: FileCheck,
    anyOf: ['admin', 'manager'],
  },
  {
    to: '/approvals',
    title: 'Approval queue',
    desc: 'Review submissions',
    icon: ClipboardList,
    anyOf: ['admin'],
  },
];

const ActionCard = ({ action }: { readonly action: QuickAction }): ReactElement => {
  const Icon = action.icon;
  return (
    <Link to={action.to} className={styles.action}>
      <span className={styles.actionIcon}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className={styles.actionText}>
        <span className={styles.actionTitle}>{action.title}</span>
        <span className={styles.actionDesc}>{action.desc}</span>
      </span>
      <ArrowRight size={16} className={styles.actionArrow} aria-hidden="true" />
    </Link>
  );
};

const CourseProgressCard = ({ course }: { readonly course: Course }): ReactElement => (
  <Link to="/courses" className={styles.courseCard}>
    <div className={styles.courseTop}>
      <Badge tone="primary">{course.category}</Badge>
      <span className={styles.courseMeta}>{course.duration}</span>
    </div>
    <h3 className={styles.courseTitle}>{course.title}</h3>
    <ProgressBar value={course.progress} showLabel tone="auto" />
  </Link>
);

const StatsRow = ({
  total,
  inProgress,
  completed,
  certificates,
}: {
  readonly total: number;
  readonly inProgress: number;
  readonly completed: number;
  readonly certificates: number;
}): ReactElement => (
  <div className={styles.stats}>
    <StatCard label="Courses" value={total} icon={PlayCircle} tone="primary" />
    <StatCard label="In progress" value={inProgress} icon={Clock} tone="info" />
    <StatCard label="Completed" value={completed} icon={CheckCircle} tone="success" />
    <StatCard label="Certificates" value={certificates} icon={Award} tone="secondary" />
  </div>
);

const ContinueLearning = ({
  courses,
  loading,
}: {
  readonly courses: readonly Course[];
  readonly loading: boolean;
}): ReactElement => {
  if (loading) {
    return <Skeleton height={110} radius={14} />;
  }
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="Nothing in progress"
        description="Start a course and it'll show up here."
        action={
          <Link to="/courses" className={styles.emptyCta}>
            Browse courses
          </Link>
        }
      />
    );
  }
  return (
    <div className={styles.courseGrid}>
      {courses.slice(0, 4).map((course) => (
        <CourseProgressCard key={course.id} course={course} />
      ))}
    </div>
  );
};

const QuickActions = ({
  user,
}: {
  readonly user: AuthenticatedUser | null;
}): ReactElement => (
  <div className={styles.actions}>
    {ACTIONS.filter(
      (action) => action.anyOf === undefined || (user?.hasAnyRole(action.anyOf) ?? false),
    ).map((action) => (
      <ActionCard key={action.to} action={action} />
    ))}
  </div>
);

/** Home dashboard: greeting, live stats, continue-learning and role-aware quick actions. */
export const DashboardPage = (): ReactElement => {
  const { user } = useAuth();
  const courses = useCourses();
  const certificates = useCertificates();

  const list = courses.data ?? [];
  const inProgress = list.filter(
    (course) => course.hasStarted() && !course.isCompleted(),
  );
  const completed = list.filter((course) => course.isCompleted());
  const firstName = (user?.fullName ?? 'there').split(' ')[0] ?? 'there';

  return (
    <section className={styles.screen}>
      <PageHeader
        title={`Welcome back, ${firstName}.`}
        subtitle="Here's your learning at a glance."
        breadcrumb="Knowledge Hub"
      />
      <StatsRow
        total={list.length}
        inProgress={inProgress.length}
        completed={completed.length}
        certificates={(certificates.data ?? []).length}
      />
      <div className={styles.columns}>
        <div className={styles.colMain}>
          <h2 className={styles.colTitle}>Continue learning</h2>
          <ContinueLearning courses={inProgress} loading={courses.isLoading} />
        </div>
        <div className={styles.colSide}>
          <h2 className={styles.colTitle}>Quick actions</h2>
          <QuickActions user={user} />
        </div>
      </div>
    </section>
  );
};
