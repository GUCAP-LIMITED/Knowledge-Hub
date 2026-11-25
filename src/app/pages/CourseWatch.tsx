import type { ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { fade } from '@shared/ui';
import { PlaybackMediaViewer } from '@features/playback';
import { QuizRunner } from '@features/quizzes/presentation';
import { cn } from '@shared/utils';
import { type Course, AssignmentLessonPlayer } from '@features/courses';
import { LessonRow } from './CourseCurriculum';
import type { LessonWithState, SectionWithState } from './course-curriculum-utils';
import {
  CourseWatchHeader,
  ExternalSourceCard,
  PreviewEnrollBanner,
} from './CourseWatchParts';
import { WatchNavFooter } from './CourseWatchNav';
import styles from './CourseDetailPage.module.css';

const LessonContent = ({
  courseId,
  lesson,
  isEnrolled,
  onMarkComplete,
}: {
  readonly courseId: string;
  readonly lesson: LessonWithState;
  readonly isEnrolled: boolean;
  readonly onMarkComplete: (lessonId: string) => void;
}): ReactElement => {
  const queryClient = useQueryClient();

  if (lesson.kind === 'quiz') {
    return (
      <QuizRunner
        quizId={lesson.quizId}
        lessonId={lesson.id}
        onPassed={() => {
          if (isEnrolled) {
            void queryClient.invalidateQueries({ queryKey: ['courses'] });
            void queryClient.invalidateQueries({ queryKey: ['course', courseId] });
          }
        }}
      />
    );
  }
  if (lesson.kind === 'assignment') {
    return (
      <AssignmentLessonPlayer
        courseId={courseId}
        lesson={lesson}
        isEnrolled={isEnrolled}
        onCompleted={() => {
          if (isEnrolled) {
            void queryClient.invalidateQueries({ queryKey: ['courses'] });
            void queryClient.invalidateQueries({ queryKey: ['course', courseId] });
          }
        }}
      />
    );
  }
  return (
    <PlaybackMediaViewer
      mediaAssetId={lesson.mediaAssetId}
      externalUrl={lesson.externalUrl}
      kind={lesson.kind}
      title={lesson.title}
      onEnded={
        isEnrolled && lesson.kind === 'video' && !lesson.completed
          ? () => {
              onMarkComplete(lesson.id);
            }
          : undefined
      }
    />
  );
};

interface CourseWatchPaneProps {
  readonly courseId: string;
  readonly lesson: LessonWithState;
  readonly sectionTitle?: string | undefined;
  readonly lessonNumber?: number | undefined;
  readonly totalLessons?: number | undefined;
  readonly prevLesson?: LessonWithState | null | undefined;
  readonly nextLesson?: LessonWithState | null | undefined;
  readonly onSelectLesson?: ((lesson: LessonWithState) => void) | undefined;
  readonly isEnrolled: boolean;
  readonly onMarkComplete: (lessonId: string) => void;
  readonly isCompleting: boolean;
  readonly onEnroll?: (() => void) | undefined;
  readonly isEnrolling?: boolean | undefined;
}

const CourseWatchPane = ({
  courseId,
  lesson,
  sectionTitle,
  lessonNumber,
  totalLessons,
  prevLesson,
  nextLesson,
  onSelectLesson,
  isEnrolled,
  onMarkComplete,
  isCompleting,
  onEnroll,
  isEnrolling,
}: CourseWatchPaneProps): ReactElement => (
  <section className={cn(styles.card, styles.watchPane)}>
    <CourseWatchHeader
      lesson={lesson}
      sectionTitle={sectionTitle}
      lessonNumber={lessonNumber}
      totalLessons={totalLessons}
      isEnrolled={isEnrolled}
    />

    {lesson.externalUrl && (
      <ExternalSourceCard
        url={lesson.externalUrl}
        label={lesson.kind === 'video' ? 'Video Source' : 'External Link'}
      />
    )}

    <AnimatePresence mode="wait">
      <motion.div
        key={lesson.id}
        variants={fade}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={styles.watchContent}
      >
        <LessonContent
          courseId={courseId}
          lesson={lesson}
          isEnrolled={isEnrolled}
          onMarkComplete={onMarkComplete}
        />

        {!isEnrolled && (
          <PreviewEnrollBanner onEnroll={onEnroll} isEnrolling={isEnrolling} />
        )}

        <WatchNavFooter
          lesson={lesson}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          onSelectLesson={onSelectLesson}
          isEnrolled={isEnrolled}
          onMarkComplete={onMarkComplete}
          isCompleting={isCompleting}
          onEnroll={onEnroll}
        />
      </motion.div>
    </AnimatePresence>
  </section>
);

const CourseWatchOutline = ({
  sections,
  lessonNumbers,
  activeLessonId,
  isEnrolled,
  done,
  total,
  onSelectLesson,
}: {
  readonly sections: readonly SectionWithState[];
  readonly lessonNumbers: ReadonlyMap<string, number>;
  readonly activeLessonId: string;
  readonly isEnrolled: boolean;
  readonly done: number;
  readonly total: number;
  readonly onSelectLesson: (lesson: LessonWithState) => void;
}): ReactElement => (
  <aside className={cn(styles.card, styles.detailsSidebar)}>
    <div className={styles.cardHead}>
      <h2 className={styles.cardTitle}>Course content</h2>
      <span className={styles.cardHint}>
        {done} of {total} complete
      </span>
    </div>
    <div>
      {sections.map((section) => (
        <div key={section.id} className={styles.sectionGroup}>
          {section.title && <div className={styles.sectionTitle}>{section.title}</div>}
          {section.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              number={lessonNumbers.get(lesson.id) ?? 0}
              locked={!isEnrolled && !lesson.isPreview}
              active={lesson.id === activeLessonId}
              onPlay={onSelectLesson}
            />
          ))}
        </div>
      ))}
    </div>
  </aside>
);

/** Full-page "watch" layout: lesson content on the left, course outline on the right. */
export const CourseWatchLayout = ({
  course,
  sections,
  lesson,
  onSelectLesson,
  onMarkComplete,
  isCompleting,
  onEnroll,
  isEnrolling,
}: {
  readonly course: Course;
  readonly sections: readonly SectionWithState[];
  readonly lesson: LessonWithState;
  readonly onSelectLesson: (lesson: LessonWithState) => void;
  readonly onMarkComplete: (lessonId: string) => void;
  readonly isCompleting: boolean;
  readonly onEnroll?: (() => void) | undefined;
  readonly isEnrolling?: boolean | undefined;
}): ReactElement => {
  const allLessons = sections.flatMap((s) => s.lessons);
  const done = allLessons.filter((l) => l.completed).length;
  const lessonNumbers = new Map(allLessons.map((l, index) => [l.id, index + 1]));

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const currentNumber = currentIndex >= 0 ? currentIndex + 1 : undefined;
  const totalLessons = allLessons.length;
  const prevLesson = currentIndex > 0 ? (allLessons[currentIndex - 1] ?? null) : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? (allLessons[currentIndex + 1] ?? null)
      : null;

  const activeSection = sections.find((s) => s.lessons.some((l) => l.id === lesson.id));
  const sectionTitle = activeSection?.title;

  return (
    <>
      <CourseWatchPane
        courseId={course.id}
        lesson={lesson}
        sectionTitle={sectionTitle}
        lessonNumber={currentNumber}
        totalLessons={totalLessons}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        onSelectLesson={onSelectLesson}
        isEnrolled={course.isEnrolled}
        onMarkComplete={onMarkComplete}
        isCompleting={isCompleting}
        onEnroll={onEnroll}
        isEnrolling={isEnrolling}
      />
      <CourseWatchOutline
        sections={sections}
        lessonNumbers={lessonNumbers}
        activeLessonId={lesson.id}
        isEnrolled={course.isEnrolled}
        done={done}
        total={allLessons.length}
        onSelectLesson={onSelectLesson}
      />
    </>
  );
};
