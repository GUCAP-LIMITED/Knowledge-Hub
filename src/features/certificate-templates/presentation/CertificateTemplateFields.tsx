import type { ChangeEvent, Dispatch, ReactElement, SetStateAction } from 'react';
import { TextField } from '@shared/ui';
import type { CertificateTemplate } from '../store/certificate-template-store';
import { TemplateTargeting } from './TemplateTargeting';
import styles from './CertificateTemplatesManager.module.css';

export interface CertificateTemplateFieldsProps {
  readonly draft: CertificateTemplate;
  readonly onChange: Dispatch<SetStateAction<CertificateTemplate>>;
}

/** The editable fields of a certificate template. */
export const CertificateTemplateFields = ({
  draft,
  onChange,
}: CertificateTemplateFieldsProps): ReactElement => {
  const onImage = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file === undefined) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (): void => {
      if (typeof reader.result === 'string') {
        const image = reader.result;
        onChange((prev) => ({ ...prev, backgroundImage: image }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.form}>
      <TextField
        label="Template name"
        placeholder="e.g. Manager gold certificate"
        value={draft.name}
        onChange={(event) => {
          onChange((prev) => ({ ...prev, name: event.target.value }));
        }}
      />
      <TemplateTargeting draft={draft} onChange={onChange} />
      <label className={styles.colorRow}>
        <span>Accent colour</span>
        <input
          type="color"
          value={draft.accentColor}
          onChange={(event) => {
            onChange((prev) => ({ ...prev, accentColor: event.target.value }));
          }}
        />
      </label>
      <label className={styles.uploadRow}>
        <span>Background image (optional)</span>
        <input type="file" accept="image/*" onChange={onImage} />
      </label>
      {draft.backgroundImage !== undefined ? (
        <img
          className={styles.preview}
          src={draft.backgroundImage}
          alt="Template background"
        />
      ) : null}
    </div>
  );
};
