import type { ReactElement } from 'react';
import { Pencil, Play, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@shared/ui';
import { useMyCapabilities } from '@features/users';
import type { Tutorial } from '../domain';
import styles from './TutorialsPage.module.css';

export interface TutorialCardActionsProps {
  readonly tutorial: Tutorial;
  readonly isBusy: boolean;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
}

/** Footer actions for a tutorial card: primary Watch action + capability-gated edit/delete. */
export const TutorialCardActions = ({
  tutorial,
  isBusy,
  onWatch,
  onEdit,
  onDelete,
}: TutorialCardActionsProps): ReactElement => {
  const { can } = useMyCapabilities();
  const canEdit = can('tutorials', 'edit') && tutorial.canModify;
  const canDelete = can('tutorials', 'delete') && tutorial.canModify;

  return (
    <div className={styles.cardFoot}>
      <Button
        size="sm"
        onClick={() => {
          onWatch(tutorial);
        }}
      >
        <Play size={14} aria-hidden="true" /> Watch
      </Button>
      {canEdit || canDelete ? (
        <div className={styles.cardAdmin}>
          {canEdit ? (
            <IconButton
              label="Edit tutorial"
              onClick={() => {
                onEdit(tutorial);
              }}
            >
              <Pencil size={15} />
            </IconButton>
          ) : null}
          {canDelete ? (
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
