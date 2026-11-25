import type { ReactElement } from 'react';
import { BookOpen } from 'lucide-react';
import styles from './CoursesPage.module.css';

export interface CourseThumbProps {
  readonly duration: string;
  readonly thumbnailUrl?: string | null;
  readonly title?: string;
}

/** Cover band for a course card: real thumbnail or a styled fallback, with a duration overlay. */
export const CourseThumb = ({
  duration,
  thumbnailUrl,
  title,
}: CourseThumbProps): ReactElement => (
  <span className={styles.thumb}>
    {thumbnailUrl ? (
      <img src={thumbnailUrl} alt={title ?? ''} className={styles.thumbImg} />
    ) : (
      <span className={styles.thumbFallback}>
        <BookOpen size={28} aria-hidden="true" className={styles.thumbFallbackIcon} />
      </span>
    )}
    {duration && duration !== 'N/A' && duration !== '0m' ? (
      <span className={styles.thumbDur}>{duration}</span>
    ) : null}
  </span>
);
