import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { EmptyState } from '@shared/ui';
import type { WidgetData } from '../../../domain';
import styles from './TopRatedCoursesWidgetView.module.css';

interface CourseMeta {
  readonly courseId?: string;
  readonly title?: string;
  readonly slug?: string;
  readonly rating?: string;
  readonly reviewsCount?: string;
}

function parseCourseMeta(raw: string | null): CourseMeta {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CourseMeta;
  } catch {
    return {};
  }
}

export const TopRatedCoursesWidgetView = ({
  data,
  isEditMode,
}: {
  readonly data: WidgetData;
  readonly isEditMode?: boolean;
}): ReactElement => {
  const navigate = useNavigate();
  const points = data.series;

  if (points.length === 0) {
    return (
      <EmptyState
        title="No rated courses"
        description="Courses with learner reviews will appear here."
      />
    );
  }

  return (
    <div className={styles.container}>
      {points.map((point) => {
        const meta = parseCourseMeta(point.meta);
        const targetRoute = meta.slug
          ? `/courses/${meta.slug}`
          : meta.courseId
            ? `/courses/${meta.courseId}`
            : null;

        const handleClick = (e: React.MouseEvent): void => {
          if (isEditMode) {
            e.preventDefault();
            return;
          }
          if (targetRoute) {
            navigate(targetRoute);
          }
        };

        const handleKeyDown = (e: React.KeyboardEvent): void => {
          if (isEditMode) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (targetRoute) {
              navigate(targetRoute);
            }
          }
        };

        return (
          <div
            key={meta.courseId ?? point.label}
            className={styles.courseRow}
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            <span className={styles.courseTitle} title={point.label}>
              {point.label}
            </span>
            <div className={styles.ratingContainer}>
              <span className={styles.ratingBadge}>
                <Star size={11} fill="#d97706" color="#d97706" aria-hidden="true" />
                {meta.rating ?? point.value.toFixed(1)}
              </span>
              <span className={styles.reviewsCount}>({meta.reviewsCount ?? 0})</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
