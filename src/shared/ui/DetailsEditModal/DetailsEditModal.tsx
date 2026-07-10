import { useState, type ReactElement } from 'react';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import { Select } from '@shared/ui/Select/Select';
import { TextField } from '@shared/ui/TextField/TextField';
import styles from './DetailsEditModal.module.css';

/** One editable field: a free-text input or a dropdown of options. */
export interface EditFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly kind: 'text' | 'select';
  readonly initial: string;
  readonly options?: readonly string[];
}

export type EditDraft = Record<string, string>;

/** Open trigger for the modal — pass the item's id (or null to close). */
export interface EditableItem {
  readonly id: string;
}

const buildInitial = (fields: readonly EditFieldConfig[]): EditDraft =>
  Object.fromEntries(fields.map((field) => [field.name, field.initial]));

const Field = ({
  field,
  value,
  onChange,
}: {
  readonly field: EditFieldConfig;
  readonly value: string;
  readonly onChange: (value: string) => void;
}): ReactElement =>
  field.kind === 'select' ? (
    <Select
      label={field.label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    >
      {(field.options ?? []).map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  ) : (
    <TextField
      label={field.label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );

const EditForm = ({
  fields,
  isSubmitting,
  onCancel,
  onSave,
}: {
  readonly fields: readonly EditFieldConfig[];
  readonly isSubmitting: boolean;
  readonly onCancel: () => void;
  readonly onSave: (draft: EditDraft) => void;
}): ReactElement => {
  const [draft, setDraft] = useState<EditDraft>(() => buildInitial(fields));
  const titleEmpty = (draft.title ?? '').trim().length === 0;

  return (
    <div className={styles.body}>
      <div className={styles.fields}>
        {fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={draft[field.name] ?? ''}
            onChange={(value) => {
              setDraft((prev) => ({ ...prev, [field.name]: value }));
            }}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          isLoading={isSubmitting}
          disabled={titleEmpty}
          onClick={() => {
            onSave(draft);
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
  readonly fields: readonly EditFieldConfig[];
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onSave: (id: string, draft: EditDraft) => void;
}

/** Edit a content item's fields. Pass `item` to open; the form resets when the item changes. */
export const DetailsEditModal = ({
  item,
  heading,
  fields,
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
    description="Update the content details."
  >
    {item !== null ? (
      <EditForm
        key={item.id}
        fields={fields}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onSave={(draft) => {
          onSave(item.id, draft);
        }}
      />
    ) : null}
  </Modal>
);
