import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { Tutorial } from '../domain';
import styles from './TutorialsPage.module.css';

export interface TutorialCardProps {
  readonly tutorial: Tutorial;
}

const difficultyClass = (tutorial: Tutorial): string | undefined => {
  if (tutorial.difficulty === 'Advanced') {
    return styles.badgeAdvanced;
  }
  if (tutorial.difficulty === 'Intermediate') {
    return styles.badgeIntermediate;
  }
  return styles.badgeBeginner;
};

/** Library card for a single tutorial. Presentational — business questions come from the entity. */
export const TutorialCard = ({ tutorial }: TutorialCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <span className={styles.category}>{tutorial.category}</span>
      <span className={cn(styles.badge, difficultyClass(tutorial))}>
        {tutorial.difficulty}
      </span>
    </div>
    <h2 className={styles.cardTitle}>{tutorial.title}</h2>
    <dl className={styles.meta}>
      <div>
        <dt>Duration</dt>
        <dd>{tutorial.duration}</dd>
      </div>
      <div>
        <dt>Views</dt>
        <dd>{tutorial.views.toLocaleString()}</dd>
      </div>
    </dl>
  </article>
);
