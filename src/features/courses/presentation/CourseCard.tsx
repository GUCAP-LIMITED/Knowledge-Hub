import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Pencil, Star, Trash2, Users } from 'lucide-react';
import { Badge, Button, CategoryBadge, IconButton, ProgressBar } from '@shared/ui';
import type { Course } from '../domain';
import styles from './CoursesPage.module.css';

export interface CourseCardProps {
  readonly course: Course;
  readonly isBusy: boolean;
  readonly isAdmin: boolean;
  readonly onAdvance: (course: Course) => void;
  readonly onEdit: (course: Course) => void;
  readonly onDelete: (id: string) => void;
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
  isAdmin,
  onAdvance,
  onEdit,
  onDelete,
}: CourseCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <div className={styles.cardTags}>
        <CategoryBadge category={course.category} />
        {course.mandatory ? <Badge tone="secondary">Required</Badge> : null}
      </div>
      {isAdmin ? (
        <div className={styles.cardAdmin}>
          <IconButton
            label="Edit course"
            onClick={() => {
              onEdit(course);
            }}
          >
            <Pencil size={15} />
          </IconButton>
          <IconButton
            label="Delete course"
            variant="danger"
            disabled={isBusy}
            onClick={() => {
              onDelete(course.id);
            }}
          >
            <Trash2 size={15} />
          </IconButton>
        </div>
      ) : null}
    </div>
    <Link to={`/courses/${course.id}`} className={styles.cardTitle}>
      {course.title}
    </Link>
    <div className={styles.metaRow}>
      <span className={styles.metaItem}>
        <Clock size={14} aria-hidden="true" /> {course.duration}
      </span>
      <span className={styles.metaItem}>
        <BookOpen size={14} aria-hidden="true" /> {course.lessons} lessons
      </span>
      <span className={styles.metaItem}>
        <Star size={14} aria-hidden="true" className={styles.star} />{' '}
        {course.rating.toFixed(1)}
      </span>
      <span className={styles.metaItem}>
        <Users size={14} aria-hidden="true" /> {course.enrolled}
      </span>
    </div>
    <ProgressBar value={course.progress} showLabel tone="auto" />
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
