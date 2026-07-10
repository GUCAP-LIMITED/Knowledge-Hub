import { useState, type ReactElement } from 'react';
import { Button, Modal } from '@shared/ui';
import {
  type CertificateTemplate,
  nextTemplateId,
} from '../store/certificate-template-store';
import { CertificateTemplateFields } from './CertificateTemplateFields';

export interface CertificateTemplateEditorProps {
  readonly open: boolean;
  readonly initial: CertificateTemplate | null;
  readonly onClose: () => void;
  readonly onSave: (template: CertificateTemplate) => void;
}

const blank = (): CertificateTemplate => ({
  id: nextTemplateId(),
  name: '',
  userType: 'all',
  contentKind: 'all',
  accentColor: '#045d5e',
});

/** Create/edit a certificate template: name, targeting, accent colour and background image. */
export const CertificateTemplateEditor = ({
  open,
  initial,
  onClose,
  onSave,
}: CertificateTemplateEditorProps): ReactElement => {
  const [draft, setDraft] = useState<CertificateTemplate>(() => initial ?? blank());

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title={initial === null ? 'New certificate template' : 'Edit certificate template'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={draft.name.trim() === ''}
            onClick={() => {
              onSave({ ...draft, name: draft.name.trim() });
            }}
          >
            Save template
          </Button>
        </>
      }
    >
      <CertificateTemplateFields draft={draft} onChange={setDraft} />
    </Modal>
  );
};
