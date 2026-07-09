import type { ReactElement } from 'react';
import { Check, Clock, Play } from 'lucide-react';
import { Badge, MediaViewer, Modal, demoAsset } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Course } from '@features/courses';
import styles from './CourseDetailPage.module.css';

export interface Lesson {
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

/** Curriculum list — each lesson opens a player. */
export const CurriculumCard = ({
  course,
  onPlay,
}: {
  readonly course: Course;
  readonly onPlay: (lesson: Lesson) => void;
}): ReactElement => {
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
          <button
            key={lesson.id}
            type="button"
            className={styles.lesson}
            onClick={() => {
              onPlay(lesson);
            }}
          >
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
            <Play size={15} aria-hidden="true" className={styles.lessonPlay} />
          </button>
        ))}
      </div>
    </section>
  );
};

/** Modal video player for a chosen lesson. */
export const LessonPlayer = ({
  lesson,
  courseTitle,
  onClose,
}: {
  readonly lesson: Lesson | null;
  readonly courseTitle: string;
  readonly onClose: () => void;
}): ReactElement => (
  <Modal
    open={lesson !== null}
    onOpenChange={(next) => {
      if (!next) {
        onClose();
      }
    }}
    title={lesson ? `Lesson ${String(lesson.id)} · ${lesson.title}` : 'Lesson'}
    description={courseTitle}
    size="lg"
  >
    {lesson !== null ? <MediaViewer asset={demoAsset('video', lesson.title)} /> : null}
  </Modal>
);
