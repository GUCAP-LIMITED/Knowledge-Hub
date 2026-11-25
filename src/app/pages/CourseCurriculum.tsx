import type { ReactElement } from 'react';
import {
  Check,
  Clock,
  Edit2,
  Lock,
  Play,
  FileText,
  HelpCircle,
  Clipboard,
  Link,
} from 'lucide-react';
import { Badge, IconButton, Tooltip } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Course } from '@features/courses';
import { type LessonWithState, buildCurriculum } from './course-curriculum-utils';
import styles from './CourseDetailPage.module.css';

const getLessonIcon = (kind: string, size = 15): ReactElement => {
  switch (kind) {
    case 'video':
      return <Play size={size} aria-hidden="true" />;
    case 'pdf':
      return <FileText size={size} aria-hidden="true" />;
    case 'quiz':
      return <HelpCircle size={size} aria-hidden="true" />;
    case 'assignment':
      return <Clipboard size={size} aria-hidden="true" />;
    case 'link':
      return <Link size={size} aria-hidden="true" />;
    default:
      return <Play size={size} aria-hidden="true" />;
  }
};

const CurriculumCardHead = ({
  done,
  total,
  canEdit,
  onEdit,
}: {
  readonly done: number;
  readonly total: number;
  readonly canEdit: boolean;
  readonly onEdit: () => void;
}): ReactElement => (
  <div className={styles.cardHead}>
    <h2 className={styles.cardTitle}>Curriculum</h2>
    <div className={styles.cardHeadActions}>
      <span className={styles.cardHint}>
        {done} of {total} complete
      </span>
      {canEdit && (
        <Tooltip label="Edit curriculum">
          <IconButton label="Edit curriculum" onClick={onEdit}>
            <Edit2 size={14} aria-hidden="true" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  </div>
);

const ENROLL_TOOLTIP = 'Please enroll in the course to unlock this lesson';

export const LessonRow = ({
  lesson,
  number,
  locked,
  active,
  onPlay,
}: {
  readonly lesson: LessonWithState;
  readonly number: number;
  readonly locked: boolean;
  readonly active?: boolean;
  readonly onPlay: (lesson: LessonWithState) => void;
}): ReactElement => {
  const title = (
    <div className={cn(styles.lessonTitle, lesson.current && styles.lessonTitleCurrent)}>
      {lesson.title}
    </div>
  );

  return (
    <button
      type="button"
      className={cn(
        styles.lesson,
        locked && styles.lessonLocked,
        active && styles.lessonActive,
      )}
      aria-disabled={locked}
      onClick={() => {
        if (!locked) {
          onPlay(lesson);
        }
      }}
    >
      <span
        className={cn(
          styles.lessonNum,
          lesson.completed && styles.lessonDone,
          lesson.current && styles.lessonCurrent,
        )}
      >
        {lesson.completed ? <Check size={14} aria-hidden="true" /> : number}
      </span>
      <div className={styles.lessonBody}>
        {locked ? (
          <Tooltip label={ENROLL_TOOLTIP} align="start">
            {title}
          </Tooltip>
        ) : (
          title
        )}
        <div className={styles.lessonMeta}>
          <Clock size={11} aria-hidden="true" /> {lesson.duration}
          {lesson.current ? (
            <Badge tone="primary" size="sm">
              Current
            </Badge>
          ) : null}
          {lesson.isPreview ? (
            <Badge tone="success" size="sm">
              Free Preview
            </Badge>
          ) : null}
        </div>
      </div>
      <div className={styles.lessonPlay}>
        {locked ? (
          <Tooltip label={ENROLL_TOOLTIP} align="start">
            <Lock size={15} aria-hidden="true" />
          </Tooltip>
        ) : (
          getLessonIcon(lesson.kind, 15)
        )}
      </div>
    </button>
  );
};

/** Curriculum list — each lesson opens a player. Lessons are locked until the learner enrolls, except free preview lessons. */
export const CurriculumCard = ({
  course,
  onPlay,
  canEdit,
  onEdit,
}: {
  readonly course: Course;
  readonly onPlay: (lesson: LessonWithState) => void;
  readonly canEdit: boolean;
  readonly onEdit: () => void;
}): ReactElement => {
  const sections = buildCurriculum(course);
  const allLessons = sections.flatMap((s) => s.lessons);
  const done = allLessons.filter((lesson) => lesson.completed).length;
  const lessonNumbers = new Map(
    allLessons.map((lesson, index) => [lesson.id, index + 1]),
  );

  return (
    <section className={styles.card}>
      <CurriculumCardHead
        done={done}
        total={allLessons.length}
        canEdit={canEdit}
        onEdit={onEdit}
      />
      <div>
        {sections.map((section) => (
          <div key={section.id} className={styles.sectionGroup}>
            {section.title && <div className={styles.sectionTitle}>{section.title}</div>}
            {section.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                number={lessonNumbers.get(lesson.id) ?? 0}
                locked={!course.isEnrolled && !lesson.isPreview}
                onPlay={onPlay}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
