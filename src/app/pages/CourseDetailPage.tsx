import { useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Hash,
  Play,
  Star,
  Users,
} from 'lucide-react';
import { Alert, Skeleton } from '@shared/ui';
import { cn } from '@shared/utils';
import { useCourse, useUpdateCourseProgress, type Course } from '@features/courses';
import { useAuth } from '@features/auth';
import { QuizSection } from '@features/quizzes';
import { CourseReviewsPanel } from '@features/course-reviews';
import { CurriculumCard, LessonPlayer, type Lesson } from './CourseCurriculum';
import styles from './CourseDetailPage.module.css';

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

const CourseMain = ({
  course,
  isAdmin,
  isBusy,
  onAdvance,
  onPlay,
}: {
  readonly course: Course;
  readonly isAdmin: boolean;
  readonly isBusy: boolean;
  readonly onAdvance: () => void;
  readonly onPlay: (lesson: Lesson) => void;
}): ReactElement => (
  <div className={styles.main}>
    <CourseHero course={course} isBusy={isBusy} onAdvance={onAdvance} />
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>What you'll learn</h2>
      <div className={styles.outcomes}>
        {course.outcomes.map((outcome) => (
          <div key={outcome} className={styles.outcome}>
            <CheckCircle size={16} aria-hidden="true" className={styles.outcomeIcon} />
            {outcome}
          </div>
        ))}
      </div>
    </section>
    <CurriculumCard course={course} onPlay={onPlay} />
    <section className={styles.card}>
      <QuizSection
        contentId={course.id}
        contentKind="course"
        isAdmin={isAdmin}
        rewatchLabel="Re-watch course"
        onRewatch={onAdvance}
      />
    </section>
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Reviews</h2>
      <CourseReviewsPanel courseId={course.id} courseName={course.title} />
    </section>
  </div>
);

/** Rich course detail: hero, outcomes, curriculum, reviews and a details sidebar. */
export const CourseDetailPage = (): ReactElement => {
  const params = useParams();
  const id = params.id ?? '';
  const course = useCourse(id);
  const updateProgress = useUpdateCourseProgress();
  const { user } = useAuth();
  const isAdmin = user?.hasAnyRole(['admin']) ?? false;
  const [playing, setPlaying] = useState<Lesson | null>(null);

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
        <CourseMain
          course={data}
          isAdmin={isAdmin}
          isBusy={updateProgress.isPending}
          onAdvance={() => {
            updateProgress.mutate({ id: data.id, progress: nextProgress(data) });
          }}
          onPlay={setPlaying}
        />
        <DetailsSidebar course={data} />
      </div>

      <LessonPlayer
        lesson={playing}
        courseTitle={data.title}
        onClose={() => {
          setPlaying(null);
        }}
      />
    </section>
  );
};
