import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { Select } from '@shared/ui';
import {
  type CertificateTemplate,
  TEMPLATE_KINDS,
  TEMPLATE_USER_TYPES,
} from '../store/certificate-template-store';
import styles from './CertificateTemplatesManager.module.css';

export interface TemplateTargetingProps {
  readonly draft: CertificateTemplate;
  readonly onChange: Dispatch<SetStateAction<CertificateTemplate>>;
}

/** The user-type and content-kind selectors that decide when a template applies. */
export const TemplateTargeting = ({
  draft,
  onChange,
}: TemplateTargetingProps): ReactElement => (
  <div className={styles.formRow}>
    <Select
      label="For user type"
      value={draft.userType}
      onChange={(event) => {
        onChange((prev) => ({
          ...prev,
          userType: event.target.value as CertificateTemplate['userType'],
        }));
      }}
    >
      {TEMPLATE_USER_TYPES.map((type) => (
        <option key={type} value={type}>
          {type === 'all' ? 'All user types' : type}
        </option>
      ))}
    </Select>
    <Select
      label="For content kind"
      value={draft.contentKind}
      onChange={(event) => {
        onChange((prev) => ({
          ...prev,
          contentKind: event.target.value as CertificateTemplate['contentKind'],
        }));
      }}
    >
      {TEMPLATE_KINDS.map((kind) => (
        <option key={kind} value={kind}>
          {kind === 'all' ? 'All content' : kind}
        </option>
      ))}
    </Select>
  </div>
);
