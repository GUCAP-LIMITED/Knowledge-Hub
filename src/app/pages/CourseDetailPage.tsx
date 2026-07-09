import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Hash,
  Play,
  Star,
  Users,
} from 'lucide-react';
import { Alert, Badge, Skeleton } from '@shared/ui';
import { cn } from '@shared/utils';
import { useCourse, useUpdateCourseProgress, type Course } from '@features/courses';
import { CourseReviewsPanel } from '@features/course-reviews';
import styles from './CourseDetailPage.module.css';

interface Lesson {
  readonly id: number;
  readonly title: string;
  readonly duration: string;
  readonly completed: boolean;
  readonly current: boolean;
}

const LESSON_TITLES = [
  'Welcome and overview',
  'Setting up your environment',
  'Core concepts',
  'Hands-on walkthrough',
  'Common pitfalls and how to avoid them',
  'Real-world scenarios',
  'Practice exercises',
  'Assessment',
  'Advanced topics',
  'Capstone',
  'Final review',
  'Wrap-up & resources',
];

const buildCurriculum = (course: Course): readonly Lesson[] => {
  const done = Math.floor((course.progress / 100) * course.lessons);
  return Array.from({ length: course.lessons }, (_, index) => ({
    id: index + 1,
    title: LESSON_TITLES[index % LESSON_TITLES.length] ?? `Lesson ${String(index + 1)}`,
    duration: `${String(8 + ((index * 7) % 14))} min`,
    completed: index < done,
    current: index === done && course.progress > 0 && course.progress < 100,
  }));
};

const nextProgress = (course: Course): number =>
  course.hasStarted() ? Math.min(100, course.progress + 10) : 5;

const CourseHero = ({
  course,
  onAdvance,
  isBusy,
}: {
  readonly course: Course;
  readonly onAdvance: () => void;
  readonly isBusy: boolean;
}): ReactElement => (
  <div className={styles.hero}>
    <div className={styles.heroBadges}>
      <span className={styles.heroTag}>{course.category}</span>
      {course.mandatory ? (
        <span className={cn(styles.heroTag, styles.heroTagDanger)}>Mandatory</span>
      ) : null}
      {course.isCompleted() ? (
        <span className={cn(styles.heroTag, styles.heroTagSuccess)}>
          <CheckCircle size={12} aria-hidden="true" /> Completed
        </span>
      ) : null}
    </div>
    <h1 className={styles.heroTitle}>{course.title}</h1>
    <div className={styles.heroMeta}>
      <span>
        <BookOpen size={14} aria-hidden="true" /> {course.lessons} lessons
      </span>
      <span>
        <Clock size={14} aria-hidden="true" /> {course.duration}
      </span>
      <span>
        <Users size={14} aria-hidden="true" /> {course.enrolled.toLocaleString()} enrolled
      </span>
      <span>
        <Star size={14} aria-hidden="true" /> {course.rating.toFixed(1)}
      </span>
    </div>
    {course.hasStarted() && !course.isCompleted() ? (
      <div className={styles.heroProgress}>
        <div className={styles.heroProgressTop}>
          <span>Your progress</span>
          <span>{course.progress}%</span>
        </div>
        <div className={styles.heroProgressTrack}>
          <div
            className={styles.heroProgressFill}
            style={{ width: `${String(course.progress)}%` }}
          />
        </div>
      </div>
    ) : null}
    <div className={styles.heroActions}>
      {!course.isCompleted() ? (
        <button
          type="button"
          className={styles.heroPrimary}
          onClick={onAdvance}
          disabled={isBusy}
        >
          <Play size={16} aria-hidden="true" />{' '}
          {course.hasStarted() ? 'Continue learning' : 'Start course'}
        </button>
      ) : (
        <Link to="/certificates" className={styles.heroSecondary}>
          <Award size={16} aria-hidden="true" /> View certificate
        </Link>
      )}
    </div>
  </div>
);

const CurriculumCard = ({ course }: { readonly course: Course }): ReactElement => {
  const lessons = buildCurriculum(course);
  const done = lessons.filter((lesson) => lesson.completed).length;
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Curriculum</h2>
        <span className={styles.cardHint}>
          {done} of {lessons.length} complete
        </span>
      </div>
      <div>
        {lessons.map((lesson) => (
          <div key={lesson.id} className={styles.lesson}>
            <span
              className={cn(
                styles.lessonNum,
                lesson.completed && styles.lessonDone,
                lesson.current && styles.lessonCurrent,
              )}
            >
              {lesson.completed ? <Check size={14} aria-hidden="true" /> : lesson.id}
            </span>
            <div className={styles.lessonBody}>
              <div
                className={cn(
                  styles.lessonTitle,
                  lesson.current && styles.lessonTitleCurrent,
                )}
              >
                Lesson {lesson.id} · {lesson.title}
              </div>
              <div className={styles.lessonMeta}>
                <Clock size={11} aria-hidden="true" /> {lesson.duration}
                {lesson.current ? (
                  <Badge tone="primary" size="sm">
                    Current
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const DetailsSidebar = ({ course }: { readonly course: Course }): ReactElement => {
  const rows = [
    { label: 'Category', value: course.category, icon: Hash },
    { label: 'Duration', value: course.duration, icon: Clock },
    { label: 'Lessons', value: `${String(course.lessons)} lessons`, icon: BookOpen },
    {
      label: 'Enrolled',
      value: `${course.enrolled.toLocaleString()} learners`,
      icon: Users,
    },
    { label: 'Added', value: course.addedDate.toLocaleDateString(), icon: Calendar },
    { label: 'Type', value: course.mandatory ? 'Mandatory' : 'Optional', icon: Star },
  ];
  return (
    <aside className={styles.card}>
      <h2 className={styles.sidebarTitle}>Course details</h2>
      {rows.map((row) => (
        <div key={row.label} className={styles.detailRow}>
          <row.icon size={16} aria-hidden="true" className={styles.detailIcon} />
          <div>
            <div className={styles.detailLabel}>{row.label}</div>
            <div className={styles.detailValue}>{row.value}</div>
          </div>
        </div>
      ))}
    </aside>
  );
};

/** Rich course detail: hero, outcomes, curriculum, reviews and a details sidebar. */
export const CourseDetailPage = (): ReactElement => {
  const params = useParams();
  const id = params.id ?? '';
  const course = useCourse(id);
  const updateProgress = useUpdateCourseProgress();

  const backLink = (
    <Link to="/courses" className={styles.back}>
      <ArrowLeft size={15} aria-hidden="true" /> Back to catalog
    </Link>
  );

  if (course.isLoading) {
    return (
      <section className={styles.screen}>
        {backLink}
        <Skeleton height={200} radius={20} />
      </section>
    );
  }
  if (course.isError || course.data === undefined) {
    return (
      <section className={styles.screen}>
        {backLink}
        <Alert tone="error" title="Course not found">
          {course.error?.message ?? 'This course could not be loaded.'}
        </Alert>
      </section>
    );
  }

  const data = course.data;
  return (
    <section className={styles.screen}>
      {backLink}
      <div className={styles.layout}>
        <div className={styles.main}>
          <CourseHero
            course={data}
            isBusy={updateProgress.isPending}
            onAdvance={() => {
              updateProgress.mutate({ id: data.id, progress: nextProgress(data) });
            }}
          />
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>What you'll learn</h2>
            <div className={styles.outcomes}>
              {data.outcomes.map((outcome) => (
                <div key={outcome} className={styles.outcome}>
                  <CheckCircle
                    size={16}
                    aria-hidden="true"
                    className={styles.outcomeIcon}
                  />
                  {outcome}
                </div>
              ))}
            </div>
          </section>
          <CurriculumCard course={data} />
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Reviews</h2>
            <CourseReviewsPanel courseId={data.id} courseName={data.title} />
          </section>
        </div>
        <DetailsSidebar course={data} />
      </div>
    </section>
  );
};
