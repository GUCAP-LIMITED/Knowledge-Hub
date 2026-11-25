import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ThumbsUp, Users } from 'lucide-react';
import {
  Badge,
  Button,
  CategoryBadge,
  ProgressBar,
  RatingStars,
  StatusBadge,
} from '@shared/ui';
import { sanitizeRichText, useHoverPreview } from '@shared/utils';
import type { Course } from '../domain';
import { courseActionState, type CourseActionState } from './course-action-state';
import { CourseCardAdmin } from './CourseCardAdmin';
import { CourseCardPreview } from './CourseCardPreview';
import { CourseThumb } from './CourseThumb';
import { useCourseCategoryName } from './use-course-category';
import styles from './CoursesPage.module.css';

export interface CourseCardProps {
  readonly course: Course;
  readonly isBusy: boolean;
  readonly onAdvance: (course: Course) => void;
  readonly onEdit: (course: Course) => void;
  readonly onDelete: (id: string) => void;
}

interface CourseCardFaceProps extends CourseCardProps {
  readonly categoryName: string | null;
  readonly actionState: CourseActionState;
}

const CourseStatus = ({ course }: { readonly course: Course }): ReactElement | null => {
  if (course.isCompleted()) {
    return <StatusBadge tone="success" label="Completed" />;
  }
  if (!course.isEnrolled) {
    return null;
  }
  return course.progress > 0 ? (
    <StatusBadge tone="info" label="In Progress" />
  ) : (
    <StatusBadge tone="primary" label="Enrolled" />
  );
};

const CourseCardFace = ({
  course,
  categoryName,
  actionState,
  isBusy,
  onAdvance,
  onEdit,
  onDelete,
}: CourseCardFaceProps): ReactElement => (
  <article className={styles.card}>
    <CourseThumb
      duration={course.duration}
      thumbnailUrl={course.thumbnailUrl}
      title={course.title}
    />
    <div className={styles.cardBody}>
      <div className={styles.cardTop}>
        <div className={styles.cardTags}>
          {categoryName ? <CategoryBadge category={categoryName} /> : null}
          <CourseStatus course={course} />
          {course.mandatory ? <Badge tone="secondary">Required</Badge> : null}
        </div>
        <CourseCardAdmin
          course={course}
          isBusy={isBusy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <Link to={`/courses/${course.slug || course.id}`} className={styles.cardTitle}>
        {course.title}
      </Link>
      {course.description ? (
        <div
          className={styles.cardDesc}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(course.description) }}
        />
      ) : null}
      <div className={styles.cardFooter}>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <BookOpen size={14} aria-hidden="true" /> {course.lessons}{' '}
            {course.lessons === 1 ? 'lesson' : 'lessons'}
          </span>
          <RatingStars
            rating={course.rating}
            reviewCount={course.totalReviews}
            size="sm"
          />
          <span className={styles.metaItem}>
            <Users size={14} aria-hidden="true" /> {course.enrolled}
          </span>
          <span className={styles.metaItem}>
            <ThumbsUp size={14} aria-hidden="true" /> {course.helpfulCount}
          </span>
        </div>
        <ProgressBar value={course.progress} showLabel tone="auto" />
        {actionState.disabled ? <hr className={styles.cardDivider} /> : null}
        <Button
          size="sm"
          variant={actionState.variant}
          isLoading={isBusy}
          disabled={actionState.disabled}
          onClick={() => {
            onAdvance(course);
          }}
        >
          {actionState.label}
        </Button>
      </div>
    </div>
  </article>
);

/** Catalog card for a single course. Presentational — business questions come from the entity. */
export const CourseCard = (props: CourseCardProps): ReactElement => {
  const categoryName = useCourseCategoryName(props.course.categoryId);
  const actionState = courseActionState(props.course);
  const hover = useHoverPreview();

  return (
    <div
      ref={hover.ref}
      className={styles.cardWrapper}
      onMouseEnter={hover.onMouseEnter}
      onMouseLeave={hover.onMouseLeave}
    >
      <CourseCardFace {...props} categoryName={categoryName} actionState={actionState} />
      {hover.side ? (
        <CourseCardPreview
          course={props.course}
          difficultyLabel={props.course.difficulty}
          side={hover.side}
        />
      ) : null}
    </div>
  );
};
