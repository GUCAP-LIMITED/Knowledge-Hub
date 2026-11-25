import type { ReactElement } from 'react';
import { Check, CheckCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@shared/ui';
import type { LessonWithState } from './course-curriculum-utils';
import styles from './CourseDetailPage.module.css';

export interface WatchNavFooterProps {
  readonly lesson: LessonWithState;
  readonly prevLesson?: LessonWithState | null | undefined;
  readonly nextLesson?: LessonWithState | null | undefined;
  readonly onSelectLesson?: ((lesson: LessonWithState) => void) | undefined;
  readonly isEnrolled: boolean;
  readonly onMarkComplete: (lessonId: string) => void;
  readonly isCompleting: boolean;
  readonly onEnroll?: (() => void) | undefined;
}

interface NavPrevButtonProps {
  readonly prevLesson?: LessonWithState | null | undefined;
  readonly isEnrolled: boolean;
  readonly onSelectLesson?: ((lesson: LessonWithState) => void) | undefined;
}

const NavPrevButton = ({
  prevLesson,
  isEnrolled,
  onSelectLesson,
}: NavPrevButtonProps): ReactElement => {
  if (!prevLesson) return <div />;
  const canGoPrev = isEnrolled || prevLesson.isPreview;

  return (
    <Button
      variant="outline"
      onClick={() => {
        if (canGoPrev) onSelectLesson?.(prevLesson);
      }}
      disabled={!canGoPrev}
      title={
        !canGoPrev
          ? 'Enroll in the course to access previous lesson'
          : `Previous: ${prevLesson.title}`
      }
    >
      <ChevronLeft size={16} aria-hidden="true" />
      <span>Previous</span>
    </Button>
  );
};

interface NavNextButtonProps {
  readonly nextLesson?: LessonWithState | null | undefined;
  readonly isEnrolled: boolean;
  readonly onSelectLesson?: ((lesson: LessonWithState) => void) | undefined;
  readonly onEnroll?: (() => void) | undefined;
}

const NavNextButton = ({
  nextLesson,
  isEnrolled,
  onSelectLesson,
  onEnroll,
}: NavNextButtonProps): ReactElement => {
  if (!nextLesson) return <div />;
  const canGoNext = isEnrolled || nextLesson.isPreview;

  return (
    <Button
      variant={canGoNext ? (isEnrolled ? 'default' : 'outline') : 'ghost'}
      onClick={() => {
        if (canGoNext) {
          onSelectLesson?.(nextLesson);
        } else if (onEnroll) {
          onEnroll();
        }
      }}
      disabled={!canGoNext && !onEnroll}
      title={
        !canGoNext
          ? 'Enroll in the course to unlock the next lesson'
          : `Next: ${nextLesson.title}`
      }
    >
      <span>Next</span>
      {!canGoNext ? (
        <Lock size={14} aria-hidden="true" />
      ) : (
        <ChevronRight size={16} aria-hidden="true" />
      )}
    </Button>
  );
};

interface NavCompleteButtonProps {
  readonly lesson: LessonWithState;
  readonly isEnrolled: boolean;
  readonly isCompleting: boolean;
  readonly onMarkComplete: (lessonId: string) => void;
}

const NavCompleteButton = ({
  lesson,
  isEnrolled,
  isCompleting,
  onMarkComplete,
}: NavCompleteButtonProps): ReactElement | null => {
  if (!isEnrolled) return null;
  if (lesson.completed) {
    return (
      <span className={styles.completedNotice}>
        <CheckCircle size={16} aria-hidden="true" />
        Completed
      </span>
    );
  }
  // Quiz lessons must be completed automatically by passing the quiz, not manually via button
  if (lesson.kind === 'quiz' || Boolean(lesson.quizId)) {
    return null;
  }
  return (
    <Button
      onClick={() => {
        onMarkComplete(lesson.id);
      }}
      isLoading={isCompleting}
    >
      <Check size={16} aria-hidden="true" />
      {isCompleting ? 'Marking Complete...' : 'Mark as Complete'}
    </Button>
  );
};

export const WatchNavFooter = ({
  lesson,
  prevLesson,
  nextLesson,
  onSelectLesson,
  isEnrolled,
  onMarkComplete,
  isCompleting,
  onEnroll,
}: WatchNavFooterProps): ReactElement => (
  <nav className={styles.watchNavFooter} aria-label="Lesson navigation">
    <div className={styles.watchNavLeft}>
      <NavPrevButton
        prevLesson={prevLesson}
        isEnrolled={isEnrolled}
        onSelectLesson={onSelectLesson}
      />
    </div>

    <div className={styles.watchNavCenter}>
      <NavCompleteButton
        lesson={lesson}
        isEnrolled={isEnrolled}
        isCompleting={isCompleting}
        onMarkComplete={onMarkComplete}
      />
    </div>

    <div className={styles.watchNavRight}>
      <NavNextButton
        nextLesson={nextLesson}
        isEnrolled={isEnrolled}
        onSelectLesson={onSelectLesson}
        onEnroll={onEnroll}
      />
    </div>
  </nav>
);
