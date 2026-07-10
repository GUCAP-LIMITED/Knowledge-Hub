import { useState, type ChangeEvent, type ReactElement } from 'react';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import { Select } from '@shared/ui/Select/Select';
import { TextField } from '@shared/ui/TextField/TextField';
import { Textarea } from '@shared/ui/Textarea/Textarea';
import styles from './DetailsEditModal.module.css';

/** One editable field: free text, a dropdown, a multi-line box, or a file re-upload. */
export interface EditFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly kind: 'text' | 'select' | 'textarea' | 'file';
  readonly initial: string;
  readonly options?: readonly string[];
  /** For `file` fields — the accept filter (e.g. "video/*,application/pdf"). */
  readonly accept?: string;
}

export type EditDraft = Record<string, string>;

/** Open trigger for the modal — pass the item's id (or null to close). */
export interface EditableItem {
  readonly id: string;
}

const buildInitial = (fields: readonly EditFieldConfig[]): EditDraft =>
  Object.fromEntries(fields.map((field) => [field.name, field.initial]));

const FileField = ({
  field,
  value,
  onChange,
}: {
  readonly field: EditFieldConfig;
  readonly value: string;
  readonly onChange: (value: string) => void;
}): ReactElement => {
  const onFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file === undefined) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (): void => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  return (
    <label className={styles.fileField}>
      <span className={styles.fileLabel}>{field.label}</span>
      <input type="file" accept={field.accept} onChange={onFile} />
      <span className={styles.fileNote}>
        {value === ''
          ? 'Leave empty to keep the current file.'
          : '✓ New file ready to save.'}
      </span>
    </label>
  );
};

const Field = ({
  field,
  value,
  onChange,
}: {
  readonly field: EditFieldConfig;
  readonly value: string;
  readonly onChange: (value: string) => void;
}): ReactElement => {
  if (field.kind === 'select') {
    return (
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
    );
  }
  if (field.kind === 'textarea') {
    return (
      <Textarea
        label={field.label}
        rows={3}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    );
  }
  if (field.kind === 'file') {
    return <FileField field={field} value={value} onChange={onChange} />;
  }
  return (
    <TextField
      label={field.label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};

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
    description="Update the content details, and replace the file if needed."
    size="lg"
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
