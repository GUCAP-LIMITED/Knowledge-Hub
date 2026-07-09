import type { ReactElement } from 'react';
import { Check, PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Section } from './upload-content-types';
import type { Details } from './upload-details';
import styles from './UploadPage.module.css';

export const ReviewSummary = ({
  details,
  fileCount,
  isAdmin,
  sections,
}: {
  readonly details: Details;
  readonly fileCount: number;
  readonly isAdmin: boolean;
  readonly sections: readonly Section[] | null;
}): ReactElement => {
  const lessonCount = (sections ?? []).reduce((n, s) => n + s.lessons.length, 0);
  return (
    <dl className={styles.summary}>
      <div>
        <dt>Type</dt>
        <dd>{details.type}</dd>
      </div>
      <div>
        <dt>Title</dt>
        <dd>{details.title || '—'}</dd>
      </div>
      <div>
        <dt>Files</dt>
        <dd>
          {fileCount} file{fileCount === 1 ? '' : 's'}
        </dd>
      </div>
      {sections !== null ? (
        <div>
          <dt>Curriculum</dt>
          <dd>
            {sections.length} section{sections.length === 1 ? '' : 's'} · {lessonCount}{' '}
            lesson{lessonCount === 1 ? '' : 's'}
          </dd>
        </div>
      ) : null}
      <div>
        <dt>Visibility</dt>
        <dd>{isAdmin ? 'Published immediately' : 'Submitted for review'}</dd>
      </div>
    </dl>
  );
};

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
    <h2 className={styles.doneTitle}>
      {isAdmin ? 'Published successfully' : 'Submitted for review'}
    </h2>
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
