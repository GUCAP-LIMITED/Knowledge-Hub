import type { ReactElement } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@shared/utils';
import { type ContentTypeKey, UPLOAD_CONTENT_TYPES } from './upload-content-types';
import styles from './UploadPage.module.css';

export interface UploadTypeStepProps {
  readonly selected: ContentTypeKey | null;
  readonly onSelect: (key: ContentTypeKey) => void;
}

/** Step 1 — pick what to create; the choice reconfigures the rest of the wizard. */
export const UploadTypeStep = ({
  selected,
  onSelect,
}: UploadTypeStepProps): ReactElement => (
  <div className={styles.typeGrid}>
    {UPLOAD_CONTENT_TYPES.map((type) => {
      const Icon = type.icon;
      const active = selected === type.key;
      return (
        <button
          key={type.key}
          type="button"
          className={cn(styles.typeCard, active && styles.typeCardActive)}
          onClick={() => {
            onSelect(type.key);
          }}
        >
          <span className={styles.typeTop}>
            <span className={styles.typeIcon}>
              <Icon size={22} aria-hidden="true" />
            </span>
            {active ? (
              <span className={styles.typeCheck}>
                <Check size={14} aria-hidden="true" />
              </span>
            ) : null}
          </span>
          <span className={styles.typeLabel}>{type.label}</span>
          <span className={styles.typeTagline}>{type.tagline}</span>
          <ul className={styles.typeBullets}>
            {type.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </button>
      );
    })}
  </div>
);
