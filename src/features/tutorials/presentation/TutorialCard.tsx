import type { ReactElement } from 'react';
import { Clock, Eye, PlayCircle } from 'lucide-react';
import { Badge, Button, CategoryBadge, type BadgeTone } from '@shared/ui';
import type { Difficulty, Tutorial } from '../domain';
import styles from './TutorialsPage.module.css';

const difficultyTone = (difficulty: Difficulty): BadgeTone => {
  if (difficulty === 'Advanced') {
    return 'danger';
  }
  return difficulty === 'Intermediate' ? 'warning' : 'success';
};

export interface TutorialCardProps {
  readonly tutorial: Tutorial;
}

/** Library card for a single tutorial. */
export const TutorialCard = ({ tutorial }: TutorialCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <CategoryBadge category={tutorial.category} />
      <Badge tone={difficultyTone(tutorial.difficulty)}>{tutorial.difficulty}</Badge>
    </div>
    <h2 className={styles.cardTitle}>{tutorial.title}</h2>
    <div className={styles.metaRow}>
      <span className={styles.metaItem}>
        <Clock size={14} aria-hidden="true" /> {tutorial.duration}
      </span>
      <span className={styles.metaItem}>
        <Eye size={14} aria-hidden="true" /> {tutorial.views.toLocaleString()} views
      </span>
    </div>
    <Button size="sm">
      <PlayCircle size={14} aria-hidden="true" /> Watch
    </Button>
  </article>
);
