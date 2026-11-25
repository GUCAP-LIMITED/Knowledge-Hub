import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import { PLACEHOLDERS, renderPreviewText } from './types';
import styles from './EmailTemplatesManager.module.css';

export interface PlaceholderTokensBarProps {
  readonly onInsertToken: (token: string) => void;
}

export const PlaceholderTokensBar = ({
  onInsertToken,
}: PlaceholderTokensBarProps): ReactElement => (
  <div className={styles.tokenBar}>
    <span className={styles.tokenBarLabel}>Insert merge tags:</span>
    <div className={styles.tokenChips}>
      {PLACEHOLDERS.map((item) => (
        <button
          key={item.token}
          type="button"
          className={styles.tokenButton}
          onClick={() => {
            onInsertToken(item.token);
          }}
          title={`Inserts ${item.token}`}
        >
          + {item.label}
        </button>
      ))}
    </div>
  </div>
);

export interface TemplatePreviewSectionProps {
  readonly body: string;
  readonly showPreview: boolean;
  readonly onTogglePreview: () => void;
}

export const TemplatePreviewSection = ({
  body,
  showPreview,
  onTogglePreview,
}: TemplatePreviewSectionProps): ReactElement => (
  <>
    <div className={styles.previewToggleRow}>
      <Button type="button" variant="outline" size="sm" onClick={onTogglePreview}>
        {showPreview ? 'Hide Preview' : 'Show Live Preview'}
      </Button>
    </div>

    {showPreview ? (
      <div className={styles.previewBox}>
        <div className={styles.previewHeader}>Preview with sample data:</div>
        <div className={styles.previewContent}>
          {body ? renderPreviewText(body) : <em>No message content yet.</em>}
        </div>
      </div>
    ) : null}
  </>
);
