import type { ReactElement } from 'react';
import { Play } from 'lucide-react';
import styles from './TutorialsPage.module.css';

export interface TutorialThumbProps {
  readonly duration: string;
  readonly thumbnailUrl?: string | null;
  readonly title?: string;
}

/** Video thumbnail band: real cover image or styled video backdrop, play affordance, and duration overlay. */
export const TutorialThumb = ({
  duration,
  thumbnailUrl,
  title,
}: TutorialThumbProps): ReactElement => (
  <span className={styles.thumb}>
    {thumbnailUrl ? (
      <img src={thumbnailUrl} alt={title ?? ''} className={styles.thumbImg} />
    ) : (
      <span className={styles.thumbFallback}>
        <Play size={28} aria-hidden="true" className={styles.thumbFallbackIcon} />
      </span>
    )}
    <span className={styles.thumbPlay}>
      <Play size={20} aria-hidden="true" />
    </span>
    {duration && duration !== 'N/A' && duration !== '0m' ? (
      <span className={styles.thumbDur}>{duration}</span>
    ) : null}
  </span>
);
