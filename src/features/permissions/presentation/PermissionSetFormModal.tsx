import { type ReactElement, useState } from 'react';
import { Alert, Button, Modal, TextField, Textarea } from '@shared/ui';
import { cn } from '@shared/utils';
import type { PermissionSetSummary } from '../domain';
import {
  DEFAULT_PERMISSION_SET_COLOR,
  PERMISSION_SET_COLORS,
  type PermissionSetColor,
} from './permission-set-colors';
import { useCreatePermissionSet, useUpdatePermissionSet } from './use-permissions';
import styles from './PermissionsManager.module.css';

export interface PermissionSetFormModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** When set, the modal renames/re-colours an existing set; otherwise it creates a new one. */
  readonly initial?: PermissionSetSummary;
  /** Rename mode only: invoked when the user asks to delete this set (parent shows the confirm). */
  readonly onRequestDelete?: () => void;
}

const colorFor = (set: PermissionSetSummary | undefined): PermissionSetColor =>
  PERMISSION_SET_COLORS.find((option) => option.color === set?.color) ??
  DEFAULT_PERMISSION_SET_COLOR;

const SwatchPicker = ({
  value,
  onChange,
}: {
  readonly value: PermissionSetColor;
  readonly onChange: (color: PermissionSetColor) => void;
}): ReactElement => (
  <div className={styles.swatchField}>
    <span className={styles.swatchLabel}>Colour</span>
    <div className={styles.swatchRow}>
      {PERMISSION_SET_COLORS.map((option) => (
        <button
          key={option.name}
          type="button"
          aria-label={option.name}
          aria-pressed={option.color === value.color}
          className={cn(
            styles.swatch,
            option.color === value.color && styles.swatchActive,
          )}
          style={{ backgroundColor: option.bgColor }}
          onClick={() => {
            onChange(option);
          }}
        >
          <span
            className={styles.swatchInner}
            style={{ backgroundColor: option.color }}
          />
        </button>
      ))}
    </div>
  </div>
);

interface FormState {
  readonly name: string;
  readonly setName: (v: string) => void;
  readonly description: string;
  readonly setDescription: (v: string) => void;
  readonly color: PermissionSetColor;
  readonly setColor: (c: PermissionSetColor) => void;
  readonly errorMessage: string | null;
}

const FormFields = (state: FormState): ReactElement => (
  <div className={styles.form}>
    <TextField
      label="Name"
      placeholder="e.g. Content Editor"
      value={state.name}
      onChange={(event) => {
        state.setName(event.target.value);
      }}
    />
    <Textarea
      label="Description"
      placeholder="What level of access does this set grant?"
      rows={2}
      value={state.description}
      onChange={(event) => {
        state.setDescription(event.target.value);
      }}
    />
    <SwatchPicker value={state.color} onChange={state.setColor} />
    {state.errorMessage !== null ? (
      <Alert tone="error" title="Could not save">
        {state.errorMessage}
      </Alert>
    ) : null}
  </div>
);

/**
 * Create a new permission group (starts with no grants — tune them in the editor) or rename/re-colour an
 * existing one. Renaming sends an empty permission map, so only the metadata changes.
 */
export const PermissionSetFormModal = ({
  open,
  onClose,
  initial,
  onRequestDelete,
}: PermissionSetFormModalProps): ReactElement => {
  const isEdit = initial !== undefined;
  const createSet = useCreatePermissionSet();
  const updateSet = useUpdatePermissionSet();

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState<PermissionSetColor>(() => colorFor(initial));

  const isBusy = createSet.isPending || updateSet.isPending;
  const error = createSet.error ?? updateSet.error;

  const submit = (): void => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    const desc = description.trim() === '' ? null : description.trim();
    const payload = { color: color.color, bgColor: color.bgColor, permissions: {} };
    if (initial !== undefined) {
      updateSet.mutate(
        { id: initial.id, input: { name: trimmed, description: desc, ...payload } },
        { onSuccess: onClose },
      );
    } else {
      createSet.mutate(
        { name: trimmed, description: desc, ...payload },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={isEdit ? 'Edit permission group' : 'New permission group'}
      description={
        isEdit
          ? 'Rename or recolour this permission set.'
          : 'Create a set, then choose its grants.'
      }
      footer={
        <div className={styles.formFooter}>
          {onRequestDelete !== undefined ? (
            <Button variant="ghost" onClick={onRequestDelete}>
              Delete set
            </Button>
          ) : null}
          <span className={styles.formSpacer} />
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isBusy} disabled={name.trim().length === 0}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      }
    >
      <FormFields
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        color={color}
        setColor={setColor}
        errorMessage={error !== null ? error.message : null}
      />
    </Modal>
  );
};
