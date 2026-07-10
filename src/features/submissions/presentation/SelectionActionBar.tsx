import type { ReactElement } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from './UploadPage.module.css';

export interface SelectionActionBarProps {
  /** Label of the selected content type, or null when nothing is chosen yet. */
  readonly selectedLabel: string | null;
  readonly onContinue: () => void;
}

/** Sticky bottom bar for the type step: shows the current selection and the guarded Continue action. */
export const SelectionActionBar = ({
  selectedLabel,
  onContinue,
}: SelectionActionBarProps): ReactElement => {
  const hasSelection = selectedLabel !== null;
  return (
    <div className={styles.selectionBar}>
      <span className={styles.selectionText} aria-live="polite">
        {hasSelection ? (
          <>
            Selected: <strong>{selectedLabel}</strong>
          </>
        ) : (
          'Choose a content type to continue'
        )}
      </span>
      <Button disabled={!hasSelection} onClick={onContinue}>
        Continue
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </div>
  );
};
