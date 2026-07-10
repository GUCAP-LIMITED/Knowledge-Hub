import { useState, type ReactElement } from 'react';
import { Button, Modal, TextField } from '@shared/ui';

export interface NewAccessModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreate: (name: string) => void;
}

/** Small dialog to name and create a new custom access level. */
export const NewAccessModal = ({
  open,
  onClose,
  onCreate,
}: NewAccessModalProps): ReactElement => {
  const [name, setName] = useState('');
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title="New access level"
      description="Name a custom access level, then choose what it can do."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={name.trim() === ''}
            onClick={() => {
              onCreate(name.trim());
              setName('');
            }}
          >
            Create
          </Button>
        </>
      }
    >
      <TextField
        label="Access level name"
        placeholder="e.g. Content Reviewer"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
    </Modal>
  );
};
