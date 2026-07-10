import { useState, type ReactElement } from 'react';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import { TextField } from '@shared/ui/TextField/TextField';
import styles from './DetailsEditModal.module.css';

export interface DetailsDraft {
  readonly title: string;
  readonly category: string;
}

/** Any content item editable by title + category. */
export interface EditableItem extends DetailsDraft {
  readonly id: string;
}

const EditForm = ({
  initial,
  isSubmitting,
  onCancel,
  onSave,
}: {
  readonly initial: DetailsDraft;
  readonly isSubmitting: boolean;
  readonly onCancel: () => void;
  readonly onSave: (draft: DetailsDraft) => void;
}): ReactElement => {
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category);
  return (
    <div className={styles.body}>
      <div className={styles.fields}>
        <TextField
          label="Title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
        <TextField
          label="Category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
          }}
        />
      </div>
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          isLoading={isSubmitting}
          disabled={title.trim().length === 0}
          onClick={() => {
            onSave({ title: title.trim(), category: category.trim() });
          }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
};

export interface DetailsEditModalProps {
  readonly item: EditableItem | null;
  readonly heading: string;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onSave: (id: string, draft: DetailsDraft) => void;
}

/** Edit a content item's title + category. Pass `item` to open; it resets when the item changes. */
export const DetailsEditModal = ({
  item,
  heading,
  isSubmitting,
  onClose,
  onSave,
}: DetailsEditModalProps): ReactElement => (
  <Modal
    open={item !== null}
    onOpenChange={(next) => {
      if (!next) {
        onClose();
      }
    }}
    title={heading}
    description="Update the title and category."
  >
    {item !== null ? (
      <EditForm
        key={item.id}
        initial={item}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onSave={(draft) => {
          onSave(item.id, draft);
        }}
      />
    ) : null}
  </Modal>
);
