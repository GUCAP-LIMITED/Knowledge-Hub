import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn, sanitizeRichText } from '@shared/utils';
import type { Course } from '../domain';
import styles from './CoursesPage.module.css';

export interface CourseCardPreviewProps {
  readonly course: Course;
  readonly difficultyLabel: string | null;
  readonly side: 'left' | 'right';
}

/** Udemy-style hover preview: title, freshness, level, and the "what you'll learn" pitch. */
export const CourseCardPreview = ({
  course,
  difficultyLabel,
  side,
}: CourseCardPreviewProps): ReactElement => {
  const navigate = useNavigate();
  const metaLine = difficultyLabel
    ? `${course.duration} · ${difficultyLabel}`
    : course.duration;

  return (
    <div
      className={cn(
        styles.cardPreview,
        side === 'left' ? styles.cardPreviewLeft : styles.cardPreviewRight,
      )}
    >
      <div className={styles.cardPreviewScroll}>
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>{course.title}</h3>
          {course.subtitle ? (
            <p className={styles.previewSubtitle}>{course.subtitle}</p>
          ) : null}
        </div>
        <p className={styles.previewUpdated}>
          Updated {course.updatedAt.toLocaleDateString()}
        </p>
        <p className={styles.previewMeta}>{metaLine}</p>
        {course.description ? (
          <div
            className={styles.previewDesc}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(course.description) }}
          />
        ) : null}
        {course.outcomes.length > 0 ? (
          <div className={styles.previewOutcomesBlock}>
            <h4 className={styles.previewOutcomesTitle}>What you&apos;ll learn</h4>
            <ul className={styles.previewOutcomes}>
              {course.outcomes.map((outcome) => (
                <li key={outcome} className={styles.previewOutcome}>
                  <CheckCircle
                    size={14}
                    aria-hidden="true"
                    className={styles.previewOutcomeIcon}
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className={styles.cardPreviewFooter}>
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            navigate(`/courses/${course.slug || course.id}`);
          }}
        >
          Visit course
        </Button>
      </div>
    </div>
  );
};
