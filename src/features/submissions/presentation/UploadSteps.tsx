import type { ReactElement } from 'react';
import { Check, PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import styles from './UploadPage.module.css';

export const DoneCard = ({
  isAdmin,
  onReset,
}: {
  readonly isAdmin: boolean;
  readonly onReset: () => void;
}): ReactElement => (
  <div className={cn(styles.card, styles.doneCard)}>
    <span className={styles.doneIcon}>
      <Check size={34} aria-hidden="true" />
    </span>
    <h2 className={styles.doneTitle}>{isAdmin ? 'Published' : 'Submitted for review'}</h2>
    <p className={styles.doneText}>
      {isAdmin
        ? 'Your content is now visible to all users.'
        : 'Admins will review your submission and notify you of the decision.'}
    </p>
    <div className={styles.doneActions}>
      <Button onClick={onReset}>
        <PlusCircle size={16} aria-hidden="true" /> Upload another
      </Button>
    </div>
  </div>
);
