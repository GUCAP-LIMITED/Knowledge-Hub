import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink, PlusCircle } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import { useCanAccessRoute } from '@features/permissions';
import { type CreatedContent, uploadResultLink } from './upload-result-link';
import styles from './UploadPage.module.css';

const ViewCreatedButton = ({
  created,
  isAdmin,
}: {
  readonly created: CreatedContent;
  readonly isAdmin: boolean;
}): ReactElement | null => {
  const navigate = useNavigate();
  const link = uploadResultLink(created, isAdmin);
  const canOpen = useCanAccessRoute(link.guardPath);
  if (!canOpen) return null;
  return (
    <Button
      variant="outline"
      onClick={() => {
        navigate(link.to);
      }}
    >
      <ExternalLink size={16} aria-hidden="true" /> {link.label}
    </Button>
  );
};

export const DoneCard = ({
  isAdmin,
  created,
  onReset,
}: {
  readonly isAdmin: boolean;
  readonly created: CreatedContent | null;
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
      {created === null ? null : (
        <ViewCreatedButton created={created} isAdmin={isAdmin} />
      )}
      <Button onClick={onReset}>
        <PlusCircle size={16} aria-hidden="true" /> Upload another
      </Button>
    </div>
  </div>
);
