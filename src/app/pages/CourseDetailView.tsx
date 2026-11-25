/* eslint-disable max-lines */
import { useState, type ReactElement } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Edit2,
  Hash,
  Play,
  Star,
  Users,
} from 'lucide-react';
import {
  Button,
  Celebration,
  HelpfulVoteButton,
  IconButton,
  Tooltip,
  fadeUp,
} from '@shared/ui';
import { cn } from '@shared/utils';
import {
  useUpdateCourseProgress,
  useEnrollCourse,
  useMarkLessonComplete,
  useCourseCategoryName,
  useMarkCourseHelpful,
  useUpdateCourse,
  CourseEditModal,
  type Course,
} from '@features/courses';
import { useMyCapabilities } from '@features/users';
import {
  CertificateModal,
  useCertificate,
  useCertificatesModule,
} from '@features/certificates';
import { useQuizProgressStore } from '@features/quizzes';
import {
  averageRating,
  useCourseReviews,
  CourseReviewsPanel,
} from '@features/course-reviews';
import { CurriculumCard } from './CourseCurriculum';
import { CourseWatchLayout } from './CourseWatch';
import { buildCurriculum, type LessonWithState } from './course-curriculum-utils';
import styles from './CourseDetailPage.module.css';

const resolveActiveLesson = (
  course: Course,
  allLessons: readonly LessonWithState[],
  lessonId: string | null,
): LessonWithState | null => {
  if (!lessonId) return null;
  const match = allLessons.find((l) => l.id === lessonId) ?? null;
  if (!match) return null;
  return course.isEnrolled || match.isPreview ? match : null;
};

const HeroCta = ({
  course,
  certReady,
  isBusy,
  isCertificateLoading,
  onAdvance,
  onOpenQuiz,
  onViewCertificate,
}: {
  readonly course: Course;
  readonly certReady: boolean;
  readonly isBusy: boolean;
  readonly isCertificateLoading: boolean;
  readonly onAdvance: () => void;
  readonly onOpenQuiz: () => void;
  readonly onViewCertificate: () => void;
}): ReactElement => {
  if (!course.isCompleted()) {
    return (
      <Button variant="accent" size="lg" onClick={onAdvance} disabled={isBusy}>
        <Play aria-hidden="true" />{' '}
        {!course.isEnrolled
          ? 'Enroll in course'
          : course.hasStarted()
            ? 'Continue learning'
            : 'Start course'}
      </Button>
    );
  }
  if (certReady) {
    if (!course.certificateId) {
      return (
        <Button asChild variant="outline" size="lg" className={styles.heroSecondary}>
          <Link to="/certificates">
            <Award aria-hidden="true" /> View certificate
          </Link>
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="lg"
        className={styles.heroSecondary}
        onClick={onViewCertificate}
        isLoading={isCertificateLoading}
      >
        <Award aria-hidden="true" /> View certificate
      </Button>
    );
  }
  return (
    <Button variant="accent" size="lg" onClick={onOpenQuiz}>
      <ClipboardList aria-hidden="true" /> Take the quiz
    </Button>
  );
};

const CourseHeroBadges = ({ course }: { readonly course: Course }): ReactElement => {
  const categoryName = useCourseCategoryName(course.id);
  return (
    <div className={styles.heroBadges}>
      {categoryName ? <span className={styles.heroTag}>{categoryName}</span> : null}
      {course.mandatory ? (
        <span className={cn(styles.heroTag, styles.heroTagDanger)}>Mandatory</span>
      ) : null}
      {course.isCompleted() ? (
        <span className={cn(styles.heroTag, styles.heroTagSuccess)}>
          <CheckCircle size={12} aria-hidden="true" /> Completed
        </span>
      ) : null}
    </div>
  );
};

const CourseHeroMeta = ({
  course,
  rating,
}: {
  readonly course: Course;
  readonly rating: number;
}): ReactElement => (
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
    {rating > 0 ? (
      <span>
        <Star size={14} aria-hidden="true" /> {rating.toFixed(1)}
      </span>
    ) : null}
  </div>
);

const CourseHeroProgress = ({
  course,
}: {
  readonly course: Course;
}): ReactElement | null => {
  if (!course.hasStarted() || course.isCompleted()) return null;
  return (
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
  );
};

const CourseHero = ({
  course,
  certReady,
  onAdvance,
  onOpenQuiz,
  onViewCertificate,
  isBusy,
  isCertificateLoading,
}: {
  readonly course: Course;
  readonly certReady: boolean;
  readonly onAdvance: () => void;
  readonly onOpenQuiz: () => void;
  readonly onViewCertificate: () => void;
  readonly isBusy: boolean;
  readonly isCertificateLoading: boolean;
}): ReactElement => {
  const { can } = useMyCapabilities();
  const canViewReviews = can('reviews', 'view');
  const reviews = useCourseReviews(course.id, { enabled: canViewReviews });
  const rating = canViewReviews && reviews.data ? averageRating(reviews.data) : 0;

  return (
    <div className={styles.hero}>
      <CourseHeroBadges course={course} />
      <h1 className={styles.heroTitle}>{course.title}</h1>
      <CourseHeroMeta course={course} rating={rating} />
      <CourseHeroProgress course={course} />
      <div className={styles.heroActions}>
        <HeroCta
          course={course}
          certReady={certReady}
          isBusy={isBusy}
          isCertificateLoading={isCertificateLoading}
          onAdvance={onAdvance}
          onOpenQuiz={onOpenQuiz}
          onViewCertificate={onViewCertificate}
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
};

const DetailsSidebar = ({
  course,
  canEdit,
  onEditDetails,
}: {
  readonly course: Course;
  readonly canEdit?: boolean;
  readonly onEditDetails?: () => void;
}): ReactElement => {
  const categoryName = useCourseCategoryName(course.id);
  const markHelpful = useMarkCourseHelpful();

  const handleVoteHelpful = (): void => {
    if (markHelpful.isPending) return;
    markHelpful.mutate({ id: course.id });
  };

  const rows = [
    categoryName ? { label: 'Category', value: categoryName, icon: Hash } : null,
    { label: 'Duration', value: course.duration, icon: Clock },
    { label: 'Lessons', value: `${String(course.lessons)} lessons`, icon: BookOpen },
    {
      label: 'Enrolled',
      value: `${course.enrolled.toLocaleString()} learners`,
      icon: Users,
    },
    { label: 'Added', value: course.addedDate.toLocaleDateString(), icon: Calendar },
  ].filter((row) => row !== null);
  return (
    <aside className={cn(styles.card, styles.detailsSidebar)}>
      <div className={styles.sidebarHead}>
        <h2 className={styles.sidebarTitle}>Course details</h2>
        {canEdit && onEditDetails && (
          <Tooltip label="Edit course details">
            <IconButton label="Edit course details" onClick={onEditDetails}>
              <Edit2 size={14} aria-hidden="true" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      {rows.map((row) => (
        <div key={row.label} className={styles.detailRow}>
          <row.icon size={16} aria-hidden="true" className={styles.detailIcon} />
          <div>
            <div className={styles.detailLabel}>{row.label}</div>
            <div className={styles.detailValue}>{row.value}</div>
          </div>
        </div>
      ))}

      <div className={styles.helpfulBox}>
        <HelpfulVoteButton
          isHelpful={course.isHelpful}
          helpfulCount={course.helpfulCount}
          isPending={markHelpful.isPending}
          onVote={handleVoteHelpful}
        />
      </div>
    </aside>
  );
};

const CourseBreadcrumb = ({
  courseTitle,
  lessonTitle,
  onCourseClick,
}: {
  readonly courseTitle: string;
  readonly lessonTitle: string | undefined;
  readonly onCourseClick: () => void;
}): ReactElement => (
  <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <Link to="/courses" className={styles.breadcrumbLink}>
      <ArrowLeft size={14} aria-hidden="true" /> Courses
    </Link>
    <span aria-hidden="true">/</span>
    {lessonTitle !== undefined ? (
      <button
        type="button"
        className={cn(styles.breadcrumbLink, styles.breadcrumbTruncate)}
        onClick={onCourseClick}
      >
        {courseTitle}
      </button>
    ) : (
      <span className={cn(styles.breadcrumbCurrent, styles.breadcrumbTruncate)}>
        {courseTitle}
      </span>
    )}
    {lessonTitle !== undefined ? (
      <>
        <span aria-hidden="true">/</span>
        <span className={cn(styles.breadcrumbCurrent, styles.breadcrumbTruncate)}>
          {lessonTitle}
        </span>
      </>
    ) : null}
  </nav>
);

const CourseMain = ({
  course,
  canEdit,
  isBusy,
  certReady,
  isCertificateLoading,
  canViewReviews,
  onEdit,
  onAdvance,
  onPlay,
  onOpenQuiz,
  onViewCertificate,
}: {
  readonly course: Course;
  readonly canEdit: boolean;
  readonly isBusy: boolean;
  readonly certReady: boolean;
  readonly isCertificateLoading: boolean;
  readonly canViewReviews: boolean;
  readonly onEdit: () => void;
  readonly onAdvance: () => void;
  readonly onPlay: (lesson: LessonWithState) => void;
  readonly onOpenQuiz: () => void;
  readonly onViewCertificate: () => void;
}): ReactElement => (
  <div className={styles.main}>
    <CourseHero
      course={course}
      certReady={certReady}
      isBusy={isBusy}
      isCertificateLoading={isCertificateLoading}
      onAdvance={onAdvance}
      onOpenQuiz={onOpenQuiz}
      onViewCertificate={onViewCertificate}
    />
    {course.outcomes.length > 0 ? (
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
    ) : null}
    <CurriculumCard course={course} onPlay={onPlay} canEdit={canEdit} onEdit={onEdit} />
    {canViewReviews ? (
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Reviews</h2>
        <CourseReviewsPanel
          courseId={course.id}
          courseName={course.title}
          canReview={course.isCompleted()}
        />
      </section>
    ) : null}
  </div>
);

/** The loaded course detail: certificate is gated on completion + a passing quiz. */
// eslint-disable-next-line max-lines-per-function
export const CourseDetailView = ({
  course,
}: {
  readonly course: Course;
}): ReactElement => {
  const quizProgress = useQuizProgressStore((state) => state.passed);
  const updateProgress = useUpdateCourseProgress();
  const enroll = useEnrollCourse();
  const markLessonComplete = useMarkLessonComplete();
  const { can } = useMyCapabilities();
  const canEdit = can('courses', 'edit') && course.canModify;
  const canViewReviews = can('reviews', 'view');
  const navigate = useNavigate();
  const updateCourse = useUpdateCourse();
  const [editingMetadata, setEditingMetadata] = useState<Course | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewingCertificateId, setViewingCertificateId] = useState<string | null>(null);
  const { clock } = useCertificatesModule();
  const certificateQuery = useCertificate(viewingCertificateId);

  const handleViewCertificate = (): void => {
    if (course.certificateId) {
      setViewingCertificateId(course.certificateId);
    }
  };

  const handleCloseCertificate = (): void => {
    setViewingCertificateId(null);
  };

  const handleEdit = (): void => {
    navigate(`/submissions/${course.id}/edit?tab=curriculum`);
  };

  const handleOpenEditDetails = (): void => {
    setEditingMetadata(course);
  };

  const sections = buildCurriculum(course);
  const allLessons = sections.flatMap((s) => s.lessons);
  const playing = resolveActiveLesson(course, allLessons, searchParams.get('lessonId'));

  const openLesson = (lesson: LessonWithState): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('lessonId', lesson.id);
      return next;
    });
  };

  const closeLesson = (): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('lessonId');
      return next;
    });
  };

  const quizLessons = allLessons.filter((l) => l.kind === 'quiz');
  const hasQuiz = quizLessons.length > 0;
  const quizPassed =
    !hasQuiz || quizLessons.every((l) => l.completed || quizProgress[l.id] === true);
  // A backend-issued certificateId already proves the quiz was passed, so it short-circuits
  // the quizPassed query — avoids a stale/slow quiz-status fetch hiding an existing certificate.
  const certReady = course.isCompleted() && (course.certificateId !== null || quizPassed);

  const handleAdvance = (): void => {
    if (!course.isEnrolled) {
      enroll.mutate(course.id);
      return;
    }
    const currentLesson = allLessons.find((l) => l.current);
    if (currentLesson) {
      openLesson(currentLesson);
    } else {
      // All completed or no lessons
      setCelebrate(true);
    }
  };

  const handleMarkComplete = (lessonId: string): void => {
    if (!course.enrollmentId) return;
    markLessonComplete.mutate(
      { courseId: course.id, enrollmentId: course.enrollmentId, lessonId },
      {
        onSuccess: (updated) => {
          closeLesson();
          if (updated.isCompleted()) {
            const quizLesson = allLessons.find((l) => l.kind === 'quiz' && !l.completed);
            if (hasQuiz && !quizPassed && quizLesson) {
              openLesson(quizLesson);
            } else {
              setCelebrate(true);
            }
          }
        },
      },
    );
  };

  return (
    <>
      <Celebration show={celebrate} />
      <CourseBreadcrumb
        courseTitle={course.title}
        lessonTitle={playing?.title}
        onCourseClick={closeLesson}
      />
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.div
            key="watch"
            className={styles.layout}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <CourseWatchLayout
              course={course}
              sections={sections}
              lesson={playing}
              onSelectLesson={openLesson}
              onMarkComplete={handleMarkComplete}
              isCompleting={markLessonComplete.isPending}
              onEnroll={() => {
                enroll.mutate(course.id);
              }}
              isEnrolling={enroll.isPending}
            />
          </motion.div>
        ) : (
          <motion.div
            key="browse"
            className={styles.layout}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <CourseMain
              course={course}
              canEdit={canEdit}
              isBusy={updateProgress.isPending || enroll.isPending}
              certReady={certReady}
              isCertificateLoading={
                viewingCertificateId !== null && certificateQuery.isFetching
              }
              canViewReviews={canViewReviews}
              onEdit={handleEdit}
              onAdvance={handleAdvance}
              onPlay={openLesson}
              onOpenQuiz={() => {
                const quizLesson =
                  allLessons.find((l) => l.kind === 'quiz' && !l.completed) ??
                  allLessons.find((l) => l.kind === 'quiz');
                if (quizLesson) {
                  openLesson(quizLesson);
                }
              }}
              onViewCertificate={handleViewCertificate}
            />
            <DetailsSidebar
              course={course}
              canEdit={canEdit}
              onEditDetails={handleOpenEditDetails}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CourseEditModal
        editing={editingMetadata}
        update={updateCourse}
        onClose={() => {
          setEditingMetadata(null);
        }}
      />

      <CertificateModal
        certificate={certificateQuery.data ?? null}
        now={clock.now()}
        onClose={handleCloseCertificate}
      />
    </>
  );
};
