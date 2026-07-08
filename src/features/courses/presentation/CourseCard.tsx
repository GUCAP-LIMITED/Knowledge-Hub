import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Course } from '../domain';
import styles from './CoursesPage.module.css';

export interface CourseCardProps {
  readonly course: Course;
  readonly isBusy: boolean;
  readonly onAdvance: (course: Course) => void;
}

const actionLabel = (course: Course): string => {
  if (course.isCompleted()) {
    return 'Completed';
  }
  return course.hasStarted() ? 'Continue' : 'Start';
};

/** Catalog card for a single course. Presentational — business questions come from the entity. */
export const CourseCard = ({
  course,
  isBusy,
  onAdvance,
}: CourseCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <span className={styles.category}>{course.category}</span>
      {course.mandatory ? <span className={styles.mandatory}>Required</span> : null}
    </div>
    <h2 className={styles.cardTitle}>{course.title}</h2>
    <dl className={styles.meta}>
      <div>
        <dt>Duration</dt>
        <dd>{course.duration}</dd>
      </div>
      <div>
        <dt>Lessons</dt>
        <dd>{course.lessons}</dd>
      </div>
      <div>
        <dt>Rating</dt>
        <dd>{course.rating.toFixed(1)}</dd>
      </div>
      <div>
        <dt>Enrolled</dt>
        <dd>{course.enrolled}</dd>
      </div>
    </dl>
    <div className={styles.progressRow}>
      <div className={styles.progressTrack}>
        <div
          className={cn(
            styles.progressFill,
            course.isCompleted() && styles.progressComplete,
          )}
          style={{ width: `${String(course.progress)}%` }}
        />
      </div>
      <span className={styles.progressLabel}>{course.progress}%</span>
    </div>
    <Button
      size="sm"
      variant={course.isCompleted() ? 'ghost' : 'primary'}
      isLoading={isBusy}
      disabled={course.isCompleted()}
      onClick={() => {
        onAdvance(course);
      }}
    >
      {actionLabel(course)}
    </Button>
  </article>
);
