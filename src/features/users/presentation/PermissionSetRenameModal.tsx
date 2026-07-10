import { useState, type ReactElement } from 'react';
import { Button, Modal, TextField, Textarea } from '@shared/ui';
import type { PermissionSet } from './permission-sets';
import styles from './PermissionSets.module.css';

export interface PermissionSetRenameModalProps {
  readonly set: PermissionSet | null;
  readonly onClose: () => void;
  readonly onSave: (name: string, description: string) => void;
  readonly onDelete: (() => void) | undefined;
}

const Form = ({
  set,
  onClose,
  onSave,
  onDelete,
}: {
  readonly set: PermissionSet;
  readonly onClose: () => void;
  readonly onSave: (name: string, description: string) => void;
  readonly onDelete: (() => void) | undefined;
}): ReactElement => {
  const [name, setName] = useState(set.name);
  const [description, setDescription] = useState(set.description);
  return (
    <div className={styles.renameForm}>
      <TextField
        label="Name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
      <Textarea
        label="Description"
        rows={3}
        value={description}
        onChange={(event) => {
          setDescription(event.target.value);
        }}
      />
      <div className={styles.renameFooter}>
        {onDelete !== undefined ? (
          <Button variant="ghost" onClick={onDelete}>
            Delete set
          </Button>
        ) : null}
        <span className={styles.renameSpacer} />
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={name.trim().length === 0}
          onClick={() => {
            onSave(name.trim(), description.trim());
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

/** Rename a permission set and edit its description (and delete it, when it is a custom set). */
export const PermissionSetRenameModal = ({
  set,
  onClose,
  onSave,
  onDelete,
}: PermissionSetRenameModalProps): ReactElement => (
  <Modal
    open={set !== null}
    onOpenChange={(next) => {
      if (!next) {
        onClose();
      }
    }}
    title="Edit permission set"
    description="Rename this access level and adjust its description."
  >
    {set !== null ? (
      <Form
        key={set.id}
        set={set}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    ) : null}
  </Modal>
);
