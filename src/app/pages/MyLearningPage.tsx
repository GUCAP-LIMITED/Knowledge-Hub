import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import {
  Alert,
  EmptyState,
  PageHeader,
  ProgressBar,
  Spinner,
  StatCard,
  Tabs,
  TabsPanel,
} from '@shared/ui';
import { cn } from '@shared/utils';
import { useCourses, type Course } from '@features/courses';
import { useCertificates } from '@features/certificates';
import styles from './MyLearningPage.module.css';

const actionLabel = (course: Course): string => {
  if (course.isCompleted()) {
    return 'View details';
  }
  return course.hasStarted() ? 'Continue' : 'Start';
};

const TABS = [
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'not-started', label: 'Not started' },
] as const;

const LearningCard = ({ course }: { readonly course: Course }): ReactElement => (
  <Link to={`/courses/${course.id}`} className={styles.card}>
    <div className={styles.thumb}>
      <PlayCircle size={34} aria-hidden="true" className={styles.thumbIcon} />
      {course.isCompleted() ? (
        <span className={styles.doneBadge}>
          <CheckCircle size={14} aria-hidden="true" />
        </span>
      ) : null}
    </div>
    <div className={styles.cardBody}>
      <h3 className={styles.cardTitle}>{course.title}</h3>
      <span className={styles.meta}>
        {course.category} • {course.lessons} lessons
      </span>
      {course.hasStarted() ? (
        <ProgressBar value={course.progress} showLabel tone="auto" />
      ) : null}
      <span className={styles.cardBtn}>{actionLabel(course)}</span>
    </div>
  </Link>
);

const LearningGrid = ({
  courses,
}: {
  readonly courses: readonly Course[];
}): ReactElement => {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Nothing here yet"
        description="Start a course from the catalog to see it here."
        action={
          <Link to="/courses" className={styles.cta}>
            Browse catalog
          </Link>
        }
      />
    );
  }
  return (
    <div className={styles.grid}>
      {courses.map((course) => (
        <LearningCard key={course.id} course={course} />
      ))}
    </div>
  );
};

/** Learner's personal view of their courses, grouped by progress. */
export const MyLearningPage = (): ReactElement => {
  const courses = useCourses();
  const certificates = useCertificates();
  const [tab, setTab] = useState<string>('in-progress');
  const list = courses.data ?? [];
  const certCount = (certificates.data ?? []).length;

  const buckets = {
    'in-progress': list.filter((course) => course.hasStarted() && !course.isCompleted()),
    completed: list.filter((course) => course.isCompleted()),
    'not-started': list.filter((course) => !course.hasStarted()),
  } as const;

  if (courses.isLoading) {
    return (
      <div className={cn(styles.screen, styles.center)}>
        <Spinner size="lg" label="Loading your courses" />
      </div>
    );
  }

  if (courses.isError) {
    return (
      <section className={styles.screen}>
        <PageHeader
          title="My Learning"
          subtitle="Pick up where you left off, track completed courses, and start something new"
        />
        <Alert tone="error" title="Could not load your courses">
          {courses.error.message}
        </Alert>
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <PageHeader
        title="My Learning"
        subtitle="Pick up where you left off, track completed courses, and start something new"
      />
      <div className={styles.stats}>
        <StatCard
          label="In progress"
          value={buckets['in-progress'].length}
          icon={BookOpen}
          tone="primary"
        />
        <StatCard
          label="Completed"
          value={buckets.completed.length}
          icon={CheckCircle}
          tone="success"
        />
        <StatCard
          label="Not started"
          value={buckets['not-started'].length}
          icon={Clock}
          tone="warning"
        />
        <StatCard label="Certificates" value={certCount} icon={Award} tone="secondary" />
      </div>
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={TABS.map((entry) => ({
          value: entry.value,
          label: `${entry.label} (${String(buckets[entry.value].length)})`,
        }))}
      >
        {TABS.map((entry) => (
          <TabsPanel key={entry.value} value={entry.value}>
            <LearningGrid courses={buckets[entry.value]} />
          </TabsPanel>
        ))}
      </Tabs>
    </section>
  );
};
