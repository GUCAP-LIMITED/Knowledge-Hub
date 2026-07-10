import { useState, type ReactElement } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@shared/ui';
import {
  type CertificateTemplate,
  useCertificateTemplateStore,
} from '../store/certificate-template-store';
import { CertificateTemplateEditor } from './CertificateTemplateEditor';
import styles from './CertificateTemplatesManager.module.css';

const targetLabel = (template: CertificateTemplate): string => {
  const who = template.userType === 'all' ? 'All user types' : template.userType;
  const what = template.contentKind === 'all' ? 'all content' : template.contentKind;
  return `${who} · ${what}`;
};

/** Admin editor for certificate templates, shown in Settings. */
export const CertificateTemplatesManager = (): ReactElement => {
  const templates = useCertificateTemplateStore((state) => state.templates);
  const saveTemplate = useCertificateTemplateStore((state) => state.saveTemplate);
  const removeTemplate = useCertificateTemplateStore((state) => state.removeTemplate);
  const [editing, setEditing] = useState<CertificateTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const open = creating || editing !== null;

  return (
    <div className={styles.manager}>
      <p className={styles.lead}>
        Design certificates per user type and content kind. When a learner completes
        content, the most specific matching template is used; otherwise the standard one.
      </p>
      <div className={styles.list}>
        {templates.map((template) => (
          <div key={template.id} className={styles.row}>
            <span
              className={styles.swatch}
              style={{ backgroundColor: template.accentColor }}
              aria-hidden
            />
            <div className={styles.rowBody}>
              <span className={styles.rowName}>{template.name}</span>
              <span className={styles.rowMeta}>{targetLabel(template)}</span>
            </div>
            <div className={styles.rowActions}>
              <IconButton
                label={`Edit ${template.name}`}
                onClick={() => {
                  setEditing(template);
                }}
              >
                <Pencil size={15} aria-hidden />
              </IconButton>
              {template.id !== 'default' ? (
                <IconButton
                  label={`Delete ${template.name}`}
                  variant="danger"
                  onClick={() => {
                    removeTemplate(template.id);
                  }}
                >
                  <Trash2 size={15} aria-hidden />
                </IconButton>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="accent"
        onClick={() => {
          setCreating(true);
        }}
      >
        <Plus size={16} aria-hidden /> New template
      </Button>

      {open ? (
        <CertificateTemplateEditor
          key={editing?.id ?? 'new'}
          open={open}
          initial={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={(template) => {
            saveTemplate(template);
            setEditing(null);
            setCreating(false);
          }}
        />
      ) : null}
    </div>
  );
};
