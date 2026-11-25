import type { ReactElement } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '@shared/ui';
import { useMyCapabilities } from '@features/users';
import type { Resource } from '../domain';
import styles from './ResourceCard.module.css';

export interface ResourceCardActionsProps {
  readonly resource: Resource;
  readonly isBusy: boolean;
  readonly onEdit: (resource: Resource) => void;
  readonly onDelete: (id: string) => void;
}

/** Capability-gated edit/delete actions for a resource card. */
export const ResourceCardActions = ({
  resource,
  isBusy,
  onEdit,
  onDelete,
}: ResourceCardActionsProps): ReactElement | null => {
  const { can } = useMyCapabilities();
  const canEdit = can('resources', 'edit') && resource.canModify;
  const canDelete = can('resources', 'delete') && resource.canModify;

  if (!canEdit && !canDelete) return null;

  return (
    <div className={styles.cardFoot}>
      {canEdit ? (
        <IconButton
          label="Edit resource"
          onClick={() => {
            onEdit(resource);
          }}
        >
          <Pencil size={15} />
        </IconButton>
      ) : null}
      {canDelete ? (
        <IconButton
          label="Delete resource"
          variant="danger"
          disabled={isBusy}
          onClick={() => {
            onDelete(resource.id);
          }}
        >
          <Trash2 size={15} />
        </IconButton>
      ) : null}
    </div>
  );
};
