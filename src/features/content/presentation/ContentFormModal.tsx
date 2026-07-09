import { useState, type ReactElement } from 'react';
import { Button, Modal } from '@shared/ui';
import {
  ContentTitle,
  type ContentItem,
  type ContentStatus,
  type ContentType,
} from '../domain';
import { ContentFormFields } from './ContentFormFields';

export interface ContentFormValues {
  readonly title: string;
  readonly type: ContentType;
  readonly status: ContentStatus;
}

export interface ContentFormModalProps {
  readonly open: boolean;
  readonly editing: ContentItem | null;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (values: ContentFormValues) => void;
}

/** Create/edit modal for a content item. Title validity is enforced by the value object. */
export const ContentFormModal = ({
  open,
  editing,
  isSubmitting,
  onClose,
  onSubmit,
}: ContentFormModalProps): ReactElement => {
  const [title, setTitle] = useState(editing?.title ?? '');
  const [type, setType] = useState<ContentType>(editing?.type ?? 'Article');
  const [status, setStatus] = useState<ContentStatus>(editing?.status ?? 'draft');
  const [error, setError] = useState('');

  const submit = (): void => {
    const validated = ContentTitle.create(title);
    if (!validated.ok) {
      setError(validated.error.message);
      return;
    }
    setError('');
    onSubmit({ title: validated.value.value, type, status });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title={editing ? 'Edit content' : 'Create new content'}
      description={
        editing
          ? 'Update the title, type, or status.'
          : 'Add a new article, course, tutorial, or document.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={isSubmitting} onClick={submit}>
            {editing ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <ContentFormFields
        title={title}
        type={type}
        status={status}
        error={error}
        onTitle={setTitle}
        onType={setType}
        onStatus={setStatus}
      />
    </Modal>
  );
};
