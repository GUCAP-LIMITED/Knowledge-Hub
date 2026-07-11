import type { ReactElement } from 'react';
import { Eye } from 'lucide-react';
import { Badge, CategoryBadge, type BadgeTone } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Difficulty, Tutorial } from '../domain';
import { TutorialThumb } from './TutorialThumb';
import { TutorialCardActions } from './TutorialCardActions';
import styles from './TutorialsPage.module.css';

const difficultyTone = (difficulty: Difficulty): BadgeTone => {
  if (difficulty === 'Advanced') {
    return 'danger';
  }
  return difficulty === 'Intermediate' ? 'warning' : 'success';
};

const relativeUpdated = (date: Date): string => {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) {
    return 'Updated today';
  }
  if (days < 7) {
    return `Updated ${String(days)}d ago`;
  }
  if (days < 30) {
    return `Updated ${String(Math.floor(days / 7))}w ago`;
  }
  if (days < 365) {
    return `Updated ${String(Math.floor(days / 30))}mo ago`;
  }
  return `Updated ${String(Math.floor(days / 365))}y ago`;
};

export interface TutorialCardProps {
  readonly tutorial: Tutorial;
  readonly isBusy: boolean;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
  readonly onQuiz: (tutorial: Tutorial) => void;
}

/** Library card for a single tutorial: clickable video-style tile + secondary actions. */
export const TutorialCard = ({
  tutorial,
  isBusy,
  onWatch,
  onEdit,
  onDelete,
  onQuiz,
}: TutorialCardProps): ReactElement => (
  <article className={styles.card}>
    <button
      type="button"
      className={styles.cardMain}
      aria-label={`Watch ${tutorial.title}`}
      onClick={() => {
        onWatch(tutorial);
      }}
    >
      <TutorialThumb duration={tutorial.duration} />
      <span className={styles.cardBody}>
        <span className={styles.cardTags}>
          <CategoryBadge category={tutorial.category} />
          <span className={styles.diff}>
            <span
              className={cn(styles.diffDot, styles[difficultyTone(tutorial.difficulty)])}
            />
            {tutorial.difficulty}
          </span>
        </span>
        <span className={styles.cardTitle}>{tutorial.title}</span>
        <span className={styles.cardDesc}>{tutorial.description}</span>
        <span className={styles.metaRow}>
          <span className={styles.metaItem}>
            <Eye size={13} aria-hidden="true" /> {tutorial.views.toLocaleString()}
          </span>
          <span className={styles.metaItem}>{relativeUpdated(tutorial.updatedAt)}</span>
          {tutorial.isRecentlyUpdated(new Date()) ? (
            <Badge tone="success" size="sm">
              Updated
            </Badge>
          ) : null}
        </span>
      </span>
    </button>

    <TutorialCardActions
      tutorial={tutorial}
      isBusy={isBusy}
      onWatch={onWatch}
      onEdit={onEdit}
      onDelete={onDelete}
      onQuiz={onQuiz}
    />
  </article>
);
