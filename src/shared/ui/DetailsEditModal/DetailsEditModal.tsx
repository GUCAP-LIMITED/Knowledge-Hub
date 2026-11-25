import { useState, type ChangeEvent, type ReactElement } from 'react';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import { RichTextEditor } from '@shared/ui/RichTextEditor/RichTextEditor';
import { Select } from '@shared/ui/Select/Select';
import { TextField } from '@shared/ui/TextField/TextField';
import { Textarea } from '@shared/ui/Textarea/Textarea';
import { DurationInput } from '../DurationInput/DurationInput';
import styles from './DetailsEditModal.module.css';

export interface EditFieldOption {
  readonly value: string;
  readonly label: string;
}

/** One editable field: free text, a dropdown, a multi-line box, rich text, duration, or a file re-upload. */
export interface EditFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly kind: 'text' | 'select' | 'textarea' | 'richtext' | 'file' | 'duration';
  readonly initial: string;
  readonly options?: readonly (string | EditFieldOption)[];
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly validate?: (value: string) => string | undefined;
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

const getFieldError = (field: EditFieldConfig, value: string): string | undefined => {
  const trimmed = value.trim();
  if (field.required === true && trimmed.length === 0) {
    return `${field.label} is required.`;
  }
  if (field.maxLength !== undefined && value.length > field.maxLength) {
    return `${field.label} must not exceed ${field.maxLength.toLocaleString()} characters (current: ${value.length.toLocaleString()}).`;
  }
  if (field.validate !== undefined) {
    return field.validate(value);
  }
  return undefined;
};

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

const DurationEditField = ({
  field,
  value,
  commonProps,
  onChange,
}: {
  readonly field: EditFieldConfig;
  readonly value: string;
  readonly commonProps: Record<string, unknown>;
  readonly onChange: (value: string) => void;
}): ReactElement => (
  <DurationInput
    label={field.label}
    mode="string"
    value={value}
    {...commonProps}
    {...(field.placeholder !== undefined ? { placeholder: field.placeholder } : {})}
    onChange={(val: string | number) => {
      onChange(String(val));
    }}
  />
);

const Field = ({
  field,
  value,
  error,
  onChange,
}: {
  readonly field: EditFieldConfig;
  readonly value: string;
  readonly error?: string | undefined;
  readonly onChange: (value: string) => void;
}): ReactElement => {
  const commonProps = {
    ...(error !== undefined ? { error } : {}),
    ...(field.required !== undefined ? { required: field.required } : {}),
  };

  if (field.kind === 'select') {
    return (
      <Select
        label={field.label}
        value={value}
        {...commonProps}
        onChange={onChange}
        options={(field.options ?? []).map((option) =>
          typeof option === 'string' ? { value: option, label: option } : option,
        )}
      />
    );
  }
  if (field.kind === 'textarea') {
    return (
      <Textarea
        label={field.label}
        rows={3}
        value={value}
        {...commonProps}
        {...(field.placeholder !== undefined ? { placeholder: field.placeholder } : {})}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    );
  }
  if (field.kind === 'richtext') {
    return (
      <RichTextEditor
        label={field.label}
        initialValue={field.initial}
        {...commonProps}
        onChange={onChange}
      />
    );
  }
  if (field.kind === 'file') {
    return <FileField field={field} value={value} onChange={onChange} />;
  }
  if (field.kind === 'duration') {
    return (
      <DurationEditField
        field={field}
        value={value}
        commonProps={commonProps}
        onChange={onChange}
      />
    );
  }
  return (
    <TextField
      label={field.label}
      value={value}
      {...commonProps}
      {...(field.placeholder !== undefined ? { placeholder: field.placeholder } : {})}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};

interface DetailsEditModalInnerProps {
  readonly item: EditableItem | null;
  readonly heading: string;
  readonly description?: string | undefined;
  readonly fields: readonly EditFieldConfig[];
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onSave: (id: string, draft: EditDraft) => void;
}

const DetailsEditModalInner = ({
  item,
  heading,
  description = 'Update the content details.',
  fields,
  isSubmitting,
  onClose,
  onSave,
}: DetailsEditModalInnerProps): ReactElement => {
  const [draft, setDraft] = useState<EditDraft>(() => buildInitial(fields));
  const fieldErrors = Object.fromEntries(
    fields.map((field) => [field.name, getFieldError(field, draft[field.name] ?? '')]),
  );
  const hasErrors = Object.values(fieldErrors).some((err) => err !== undefined);
  const isSaveDisabled = isSubmitting || hasErrors;

  return (
    <Modal
      open={item !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title={heading}
      description={description}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={isSaveDisabled}
            onClick={() => {
              if (!isSaveDisabled && item !== null) {
                onSave(item.id, draft);
              }
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        {fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={draft[field.name] ?? ''}
            error={fieldErrors[field.name]}
            onChange={(value) => {
              setDraft((prev) => ({ ...prev, [field.name]: value }));
            }}
          />
        ))}
      </div>
    </Modal>
  );
};

export interface DetailsEditModalProps {
  readonly item: EditableItem | null;
  readonly heading: string;
  readonly description?: string | undefined;
  readonly fields: readonly EditFieldConfig[];
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onSave: (id: string, draft: EditDraft) => void;
}

/** Edit a content item's fields. Pass `item` to open; the form resets when the item changes. */
export const DetailsEditModal = ({
  item,
  heading,
  description,
  fields,
  isSubmitting,
  onClose,
  onSave,
}: DetailsEditModalProps): ReactElement => (
  <DetailsEditModalInner
    key={item?.id ?? 'closed'}
    item={item}
    heading={heading}
    description={description}
    fields={fields}
    isSubmitting={isSubmitting}
    onClose={onClose}
    onSave={onSave}
  />
);
