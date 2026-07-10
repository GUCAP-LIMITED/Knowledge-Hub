import type { ReactElement } from 'react';
import { ClipboardList, Clock, Eye, Pencil, PlayCircle, Trash2 } from 'lucide-react';
import { Badge, Button, CategoryBadge, IconButton, type BadgeTone } from '@shared/ui';
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
  readonly isAdmin: boolean;
  readonly isBusy: boolean;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
  readonly onQuiz: (tutorial: Tutorial) => void;
}

/** Library card for a single tutorial. */
export const TutorialCard = ({
  tutorial,
  isAdmin,
  isBusy,
  onWatch,
  onEdit,
  onDelete,
  onQuiz,
}: TutorialCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <div className={styles.cardTags}>
        <CategoryBadge category={tutorial.category} />
        <Badge tone={difficultyTone(tutorial.difficulty)}>{tutorial.difficulty}</Badge>
      </div>
      {isAdmin ? (
        <div className={styles.cardAdmin}>
          <IconButton
            label="Edit tutorial"
            onClick={() => {
              onEdit(tutorial);
            }}
          >
            <Pencil size={15} />
          </IconButton>
          <IconButton
            label="Delete tutorial"
            variant="danger"
            disabled={isBusy}
            onClick={() => {
              onDelete(tutorial.id);
            }}
          >
            <Trash2 size={15} />
          </IconButton>
        </div>
      ) : null}
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
    <div className={styles.cardActions}>
      <Button
        size="sm"
        onClick={() => {
          onWatch(tutorial);
        }}
      >
        <PlayCircle size={14} aria-hidden="true" /> Watch
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          onQuiz(tutorial);
        }}
      >
        <ClipboardList size={14} aria-hidden="true" /> {isAdmin ? 'Quizzes' : 'Quiz'}
      </Button>
    </div>
  </article>
);
