import type { ReactElement } from 'react';
import { Lightbulb, Play } from 'lucide-react';
import styles from './TutorialsPage.module.css';

export interface TutorialThumbProps {
  readonly duration: string;
}

/** Video-style thumbnail band: category-tinted frame, a play affordance, and a duration overlay. */
export const TutorialThumb = ({ duration }: TutorialThumbProps): ReactElement => (
  <span className={styles.thumb}>
    <Lightbulb size={26} aria-hidden="true" className={styles.thumbIcon} />
    <span className={styles.thumbPlay}>
      <Play size={20} aria-hidden="true" />
    </span>
    <span className={styles.thumbDur}>{duration}</span>
  </span>
);
