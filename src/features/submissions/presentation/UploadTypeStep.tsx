import type { ReactElement } from 'react';
import { type ContentTypeKey, UPLOAD_CONTENT_TYPES } from './upload-content-types';
import { ContentTypeCard } from './ContentTypeCard';
import { GuidancePanel } from './GuidancePanel';
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
  <div className={styles.typeStep}>
    <div className={styles.typeMainCol}>
      <div className={styles.typeIntro}>
        <h2 className={styles.typeHeading}>What are you publishing?</h2>
        <p className={styles.typeSubheading}>
          Pick a format to tailor the rest of the upload. You can change this before
          publishing.
        </p>
      </div>
      <div className={styles.typeList} role="radiogroup" aria-label="Content type">
        {UPLOAD_CONTENT_TYPES.map((type) => (
          <ContentTypeCard
            key={type.key}
            type={type}
            selected={selected === type.key}
            onSelect={() => {
              onSelect(type.key);
            }}
          />
        ))}
      </div>
    </div>
    <GuidancePanel />
  </div>
);
