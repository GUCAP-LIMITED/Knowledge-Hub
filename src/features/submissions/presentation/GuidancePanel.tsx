import type { ReactElement } from 'react';
import { ShieldCheck } from 'lucide-react';
import { UPLOAD_CONTENT_TYPES } from './upload-content-types';
import styles from './UploadPage.module.css';

/** Contextual side panel for the type step — explains the formats and reassures before publishing. */
export const GuidancePanel = (): ReactElement => (
  <aside className={styles.guidance} aria-label="Choosing the right format">
    <h3 className={styles.guidanceTitle}>Choosing the right format</h3>
    <ul className={styles.guidanceList}>
      {UPLOAD_CONTENT_TYPES.map((type) => {
        const Icon = type.icon;
        return (
          <li key={type.key} className={styles.guidanceItem}>
            <span className={styles.guidanceIcon}>
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className={styles.guidanceText}>
              <span className={styles.guidanceName}>{type.label}</span>
              <span className={styles.guidanceHint}>{type.tagline}</span>
            </span>
          </li>
        );
      })}
    </ul>
    <p className={styles.guidanceNote}>
      <ShieldCheck size={15} strokeWidth={1.75} aria-hidden="true" />
      You can review everything before publishing.
    </p>
  </aside>
);
