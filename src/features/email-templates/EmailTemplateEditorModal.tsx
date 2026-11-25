import { useEffect, useState, type ReactElement } from 'react';
import { Button, Modal, Switch, TextField, Textarea } from '@shared/ui';
import {
  EmailTemplateKind,
  type CreateEmailTemplateInput,
  type EmailTemplate,
  type UpdateEmailTemplateInput,
} from './types';
import { PlaceholderTokensBar, TemplatePreviewSection } from './EmailTemplatePreview';
import styles from './EmailTemplatesManager.module.css';

interface KindSelectorProps {
  readonly kind: EmailTemplateKind;
  readonly isEdit: boolean;
  readonly onChange: (kind: EmailTemplateKind) => void;
}

const KindSelector = ({ kind, isEdit, onChange }: KindSelectorProps): ReactElement => (
  <div className={styles.kindSelector}>
    <span className={styles.fieldLabel}>Type</span>
    <div className={styles.radioGroup}>
      <label className={styles.radioLabel}>
        <input
          type="radio"
          name="templateKind"
          checked={kind === EmailTemplateKind.Email}
          onChange={() => {
            onChange(EmailTemplateKind.Email);
          }}
          disabled={isEdit}
        />
        Email
      </label>
      <label className={styles.radioLabel}>
        <input
          type="radio"
          name="templateKind"
          checked={kind === EmailTemplateKind.Sms}
          onChange={() => {
            onChange(EmailTemplateKind.Sms);
          }}
          disabled={isEdit}
        />
        SMS
      </label>
    </div>
  </div>
);

interface ModalFooterActionsProps {
  readonly isEdit: boolean;
  readonly isSaving: boolean;
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
}

const ModalFooterActions = ({
  isEdit,
  isSaving,
  onCancel,
  onSubmit,
}: ModalFooterActionsProps): ReactElement => (
  <div className={styles.modalFooter}>
    <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
      Cancel
    </Button>
    <Button type="button" variant="default" onClick={onSubmit} disabled={isSaving}>
      {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Template'}
    </Button>
  </div>
);

interface FormBodyProps {
  readonly name: string;
  readonly onNameChange: (val: string) => void;
  readonly nameError: string;
  readonly kind: EmailTemplateKind;
  readonly isEdit: boolean;
  readonly onKindChange: (kind: EmailTemplateKind) => void;
  readonly onInsertToken: (token: string) => void;
  readonly body: string;
  readonly onBodyChange: (val: string) => void;
  readonly bodyError: string;
  readonly isActive: boolean;
  readonly onIsActiveChange: (active: boolean) => void;
  readonly showPreview: boolean;
  readonly onTogglePreview: () => void;
}

const FormBody = (props: FormBodyProps): ReactElement => (
  <div className={styles.formStack}>
    <TextField
      label="Template Name"
      value={props.name}
      onChange={(e) => {
        props.onNameChange(e.target.value);
      }}
      placeholder="e.g. Course Enrollment Notification"
      error={props.nameError}
      required
    />

    <KindSelector kind={props.kind} isEdit={props.isEdit} onChange={props.onKindChange} />

    <PlaceholderTokensBar onInsertToken={props.onInsertToken} />

    <Textarea
      label="Message Body"
      value={props.body}
      onChange={(e) => {
        props.onBodyChange(e.target.value);
      }}
      placeholder="Write template message here. Use merge tags for dynamic content."
      rows={6}
      error={props.bodyError}
      required
    />

    <div className={styles.switchRow}>
      <div className={styles.switchCol}>
        <span className={styles.switchTitle}>Active Status</span>
        <span className={styles.switchDesc}>
          When enabled, this template can be triggered by system notifications.
        </span>
      </div>
      <Switch
        label="Template active"
        checked={props.isActive}
        onChange={props.onIsActiveChange}
      />
    </div>

    <TemplatePreviewSection
      body={props.body}
      showPreview={props.showPreview}
      onTogglePreview={props.onTogglePreview}
    />
  </div>
);

export interface EmailTemplateEditorModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly template: EmailTemplate | null;
  readonly onSave: (input: CreateEmailTemplateInput | UpdateEmailTemplateInput) => void;
  readonly isSaving: boolean;
}

interface TemplateFormState {
  readonly isEdit: boolean;
  readonly name: string;
  readonly setName: (val: string) => void;
  readonly body: string;
  readonly setBody: (val: string) => void;
  readonly kind: EmailTemplateKind;
  readonly setKind: (kind: EmailTemplateKind) => void;
  readonly isActive: boolean;
  readonly setIsActive: (active: boolean) => void;
  readonly showPreview: boolean;
  readonly togglePreview: () => void;
  readonly nameError: string;
  readonly setNameError: (err: string) => void;
  readonly bodyError: string;
  readonly setBodyError: (err: string) => void;
  readonly handleSubmit: () => void;
}

const useTemplateForm = (
  open: boolean,
  template: EmailTemplate | null,
  onSave: (input: CreateEmailTemplateInput | UpdateEmailTemplateInput) => void,
  onOpenChange: (open: boolean) => void,
): TemplateFormState => {
  const isEdit = template !== null;
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<EmailTemplateKind>(EmailTemplateKind.Email);
  const [isActive, setIsActive] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [nameError, setNameError] = useState('');
  const [bodyError, setBodyError] = useState('');

  useEffect(() => {
    if (open) {
      setName(template?.name ?? '');
      setBody(template?.body ?? '');
      setKind(template?.kind ?? EmailTemplateKind.Email);
      setIsActive(template?.isActive ?? true);
      setShowPreview(false);
      setNameError('');
      setBodyError('');
    }
  }, [open, template]);

  const handleSubmit = (): void => {
    if (!name.trim()) {
      setNameError('Template name is required.');
      return;
    }
    if (!body.trim()) {
      setBodyError('Template body is required.');
      return;
    }
    if (isEdit) {
      onSave({ name: name.trim(), body: body.trim(), kind, isActive });
    } else {
      onSave({ name: name.trim(), body: body.trim(), kind, isDefault: false, isActive });
    }
    onOpenChange(false);
  };

  return {
    isEdit,
    name,
    setName,
    body,
    setBody,
    kind,
    setKind,
    isActive,
    setIsActive,
    showPreview,
    togglePreview: () => {
      setShowPreview((prev) => !prev);
    },
    nameError,
    setNameError,
    bodyError,
    setBodyError,
    handleSubmit,
  };
};

export const EmailTemplateEditorModal = ({
  open,
  onOpenChange,
  template,
  onSave,
  isSaving,
}: EmailTemplateEditorModalProps): ReactElement => {
  const form = useTemplateForm(open, template, onSave, onOpenChange);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={form.isEdit ? 'Edit Template' : 'Create Template'}
      description={
        form.isEdit
          ? 'Update template message and active status.'
          : 'Define a reusable communication template with merge tokens.'
      }
      size="lg"
      footer={
        <ModalFooterActions
          isEdit={form.isEdit}
          isSaving={isSaving}
          onCancel={() => {
            onOpenChange(false);
          }}
          onSubmit={form.handleSubmit}
        />
      }
    >
      <FormBody
        name={form.name}
        onNameChange={(val) => {
          form.setName(val);
          if (form.nameError) form.setNameError('');
        }}
        nameError={form.nameError}
        kind={form.kind}
        isEdit={form.isEdit}
        onKindChange={form.setKind}
        onInsertToken={(token) => {
          form.setBody(`${form.body} ${token}`.trim());
        }}
        body={form.body}
        onBodyChange={(val) => {
          form.setBody(val);
          if (form.bodyError) form.setBodyError('');
        }}
        bodyError={form.bodyError}
        isActive={form.isActive}
        onIsActiveChange={form.setIsActive}
        showPreview={form.showPreview}
        onTogglePreview={form.togglePreview}
      />
    </Modal>
  );
};
