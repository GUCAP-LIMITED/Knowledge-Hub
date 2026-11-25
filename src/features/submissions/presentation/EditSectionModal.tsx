import { useState, useEffect, type ReactElement } from 'react';
import { Button, Modal, TextField } from '@shared/ui';
import type { EditableSection } from './types';

export interface EditSectionModalProps {
  readonly section: EditableSection | null;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSave: (title: string) => void;
}

const getSectionTitleError = (title: string): string | undefined => {
  if (title.trim().length === 0) {
    return 'Section title is required.';
  }
  return title.length > 200 ? 'Section title must not exceed 200 characters.' : undefined;
};

export const EditSectionModal = ({
  section,
  open,
  onClose,
  onSave,
}: EditSectionModalProps): ReactElement => {
  const [title, setTitle] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open && section) {
      setTitle(section.title);
      setTouched(false);
    } else if (!open) {
      setTimeout(() => {
        setTitle('');
        setTouched(false);
      }, 150);
    }
  }, [section, open]);

  const error = getSectionTitleError(title);
  const isValid = error === undefined;

  return (
    <Modal
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
      title="Edit Section"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem 0',
        }}
      >
        <TextField
          label="Section Title"
          value={title}
          maxChars={200}
          error={touched || title.length > 200 ? error : undefined}
          onChange={(e) => {
            setTouched(true);
            setTitle(e.target.value);
          }}
          autoFocus
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="default"
          disabled={!isValid}
          onClick={() => {
            if (!isValid) return;
            onSave(title.trim());
            onClose();
            setTitle('');
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};
