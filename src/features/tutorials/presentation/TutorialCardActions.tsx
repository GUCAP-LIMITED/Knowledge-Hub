import type { ReactElement } from 'react';
import { ClipboardList, Pencil, Play, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@shared/ui';
import type { Tutorial } from '../domain';
import styles from './TutorialsPage.module.css';

export interface TutorialCardActionsProps {
  readonly tutorial: Tutorial;
  readonly isAdmin: boolean;
  readonly isBusy: boolean;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
  readonly onQuiz: (tutorial: Tutorial) => void;
}

/** Footer actions for a tutorial card: primary Watch, secondary Quiz, admin edit/delete. */
export const TutorialCardActions = ({
  tutorial,
  isAdmin,
  isBusy,
  onWatch,
  onEdit,
  onDelete,
  onQuiz,
}: TutorialCardActionsProps): ReactElement => (
  <div className={styles.cardFoot}>
    <Button
      size="sm"
      onClick={() => {
        onWatch(tutorial);
      }}
    >
      <Play size={14} aria-hidden="true" /> Watch
    </Button>
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        onQuiz(tutorial);
      }}
    >
      <ClipboardList size={14} aria-hidden="true" /> Quiz
    </Button>
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
);
