import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Hash,
  Play,
  Star,
  Users,
} from 'lucide-react';
import { Button, Celebration } from '@shared/ui';
import { cn } from '@shared/utils';
import { useUpdateCourseProgress, type Course } from '@features/courses';
import { useAuth } from '@features/auth';
import { QuizManagerModal, useQuizPassed, useQuizzes } from '@features/quizzes';
import { CourseReviewsPanel } from '@features/course-reviews';
import { CurriculumCard, LessonPlayer, type Lesson } from './CourseCurriculum';
import styles from './CourseDetailPage.module.css';

const nextProgress = (course: Course): number =>
  course.hasStarted() ? Math.min(100, course.progress + 10) : 5;

const HeroCta = ({
  course,
  certReady,
  isBusy,
  onAdvance,
  onOpenQuiz,
}: {
  readonly course: Course;
  readonly certReady: boolean;
  readonly isBusy: boolean;
  readonly onAdvance: () => void;
  readonly onOpenQuiz: () => void;
}): ReactElement => {
  if (!course.isCompleted()) {
    return (
      <button
        type="button"
        className={styles.heroPrimary}
        onClick={onAdvance}
        disabled={isBusy}
      >
        <Play size={16} aria-hidden="true" />{' '}
        {course.hasStarted() ? 'Continue learning' : 'Start course'}
      </button>
    );
  }
  if (certReady) {
    return (
      <Link to="/certificates" className={styles.heroSecondary}>
        <Award size={16} aria-hidden="true" /> View certificate
      </Link>
    );
  }
  return (
    <button type="button" className={styles.heroPrimary} onClick={onOpenQuiz}>
      <ClipboardList size={16} aria-hidden="true" /> Take the quiz
    </button>
  );
};

const CourseHero = ({
  course,
  certReady,
  onAdvance,
  onOpenQuiz,
  isBusy,
}: {
  readonly course: Course;
  readonly certReady: boolean;
  readonly onAdvance: () => void;
  readonly onOpenQuiz: () => void;
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
      <HeroCta
        course={course}
        certReady={certReady}
        isBusy={isBusy}
        onAdvance={onAdvance}
        onOpenQuiz={onOpenQuiz}
      />
    </div>
    {course.isCompleted() && !certReady ? (
      <p className={styles.heroHint}>
        <ClipboardList size={13} aria-hidden="true" /> Pass the quiz to unlock your
        certificate.
      </p>
    ) : null}
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
  certReady,
  onAdvance,
  onPlay,
  onOpenQuiz,
}: {
  readonly course: Course;
  readonly isAdmin: boolean;
  readonly isBusy: boolean;
  readonly certReady: boolean;
  readonly onAdvance: () => void;
  readonly onPlay: (lesson: Lesson) => void;
  readonly onOpenQuiz: () => void;
}): ReactElement => (
  <div className={styles.main}>
    <CourseHero
      course={course}
      certReady={certReady}
      isBusy={isBusy}
      onAdvance={onAdvance}
      onOpenQuiz={onOpenQuiz}
    />
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
      <div className={styles.quizRow}>
        <div>
          <h2 className={styles.cardTitle}>Quizzes</h2>
          <p className={styles.quizHint}>
            {isAdmin
              ? 'Add one or more quizzes learners must pass to earn their certificate.'
              : 'Test your knowledge — pass to unlock your certificate.'}
          </p>
        </div>
        <Button variant="accent" onClick={onOpenQuiz}>
          <ClipboardList size={16} aria-hidden="true" />{' '}
          {isAdmin ? 'Manage quizzes' : 'Take a quiz'}
        </Button>
      </div>
    </section>
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Reviews</h2>
      <CourseReviewsPanel
        courseId={course.id}
        courseName={course.title}
        canReview={certReady}
      />
    </section>
  </div>
);

/** The loaded course detail: certificate is gated on completion + a passing quiz. */
export const CourseDetailView = ({
  course,
}: {
  readonly course: Course;
}): ReactElement => {
  const quizzes = useQuizzes(course.id);
  const quizPassed = useQuizPassed(course.id);
  const updateProgress = useUpdateCourseProgress();
  const { user } = useAuth();
  const isAdmin = user?.hasAnyRole(['admin']) ?? false;
  const [playing, setPlaying] = useState<Lesson | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const hasQuiz = (quizzes.data ?? []).length > 0;
  const certReady = course.isCompleted() && (!hasQuiz || quizPassed);

  const handleAdvance = (): void => {
    const next = nextProgress(course);
    updateProgress.mutate(
      { id: course.id, progress: next },
      {
        onSuccess: () => {
          if (next < 100) return;
          // A gating quiz owns the celebration on pass; otherwise finishing is the moment.
          if (hasQuiz && !quizPassed) {
            setQuizOpen(true);
          } else {
            setCelebrate(true);
          }
        },
      },
    );
  };

  return (
    <>
      <Celebration show={celebrate} />
      <div className={styles.layout}>
        <CourseMain
          course={course}
          isAdmin={isAdmin}
          isBusy={updateProgress.isPending}
          certReady={certReady}
          onAdvance={handleAdvance}
          onPlay={setPlaying}
          onOpenQuiz={() => {
            setQuizOpen(true);
          }}
        />
        <DetailsSidebar course={course} />
      </div>

      {quizOpen ? (
        <QuizManagerModal
          open={quizOpen}
          contentId={course.id}
          contentKind="course"
          contentTitle={course.title}
          isAdmin={isAdmin}
          certificateReady={course.isCompleted()}
          onClose={() => {
            setQuizOpen(false);
          }}
        />
      ) : null}

      <LessonPlayer
        lesson={playing}
        courseTitle={course.title}
        onClose={() => {
          setPlaying(null);
        }}
      />
    </>
  );
};
