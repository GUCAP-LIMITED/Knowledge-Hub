import { useEffect, useState, type ReactElement } from 'react';
import { Alert, Button, Modal } from '@shared/ui';
import type { ContentSummary } from '@features/content';
import type { CreateAssignmentInput } from '../application';
import { AssignmentFields, type FormState } from './AssignmentFields';

export { ViewProgressModal, type ViewProgressModalProps } from './ViewProgressModal';

let nextId = 1;
const EMPTY_FORM: FormState = {
  contentItemId: '',
  assignees: [{ id: nextId++, category: 'user', targetId: '', displayName: '' }],
  dueDate: '',
};

export interface CreateModalProps {
  readonly open: boolean;
  readonly contentItems?: readonly ContentSummary[] | undefined;
  readonly contentLoading?: boolean | undefined;
  readonly creating: boolean;
  readonly error?: string | undefined;
  readonly onClose: () => void;
  readonly onCreate: (input: CreateAssignmentInput) => void;
}

const CreateModalFooter = ({
  canSubmit,
  creating,
  onClose,
  onSubmit,
}: {
  readonly canSubmit: boolean;
  readonly creating: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
}): ReactElement => (
  <>
    <Button variant="ghost" onClick={onClose}>
      Cancel
    </Button>
    <Button isLoading={creating} disabled={!canSubmit || creating} onClick={onSubmit}>
      Create assignment
    </Button>
  </>
);

/** Modal to create a new training assignment. */
export const CreateModal = ({
  open,
  creating,
  error,
  onClose,
  onCreate,
}: CreateModalProps): ReactElement => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open) {
      setForm({
        contentItemId: '',
        assignees: [{ id: nextId++, category: 'user', targetId: '', displayName: '' }],
        dueDate: '',
      });
    }
  }, [open]);

  const allAssigneesValid =
    form.assignees.length > 0 && form.assignees.every((a) => a.targetId.trim() !== '');
  const canSubmit = form.contentItemId !== '' && allAssigneesValid && form.dueDate !== '';

  const handleAddAssignee = (): void => {
    setForm((prev) => ({
      ...prev,
      assignees: [
        ...prev.assignees,
        { id: nextId++, category: 'user', targetId: '', displayName: '' },
      ],
    }));
  };

  const handleRemoveAssignee = (id: number): void => {
    setForm((prev) => ({
      ...prev,
      assignees: prev.assignees.filter((a) => a.id !== id),
    }));
  };

  const handleSubmit = (): void => {
    onCreate({
      contentItemId: form.contentItemId,
      assignees: form.assignees.map((a) => ({
        category: a.category,
        targetId: a.targetId.trim(),
        displayName: a.displayName.trim(),
      })),
      dueDate: new Date(form.dueDate),
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="New training assignment"
      description="Assign a course, tutorial, or resource to a group or individual."
      footer={
        <CreateModalFooter
          canSubmit={canSubmit}
          creating={creating}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      }
    >
      {error !== undefined ? (
        <Alert tone="error" title="Could not create assignment">
          {error}
        </Alert>
      ) : null}
      <AssignmentFields
        form={form}
        onChange={setForm}
        onAddAssignee={handleAddAssignee}
        onRemoveAssignee={handleRemoveAssignee}
      />
    </Modal>
  );
};
