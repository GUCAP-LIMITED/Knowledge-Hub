import type { ReactElement } from 'react';
import { Alert, EmptyState, Spinner } from '@shared/ui';
import type { Tutorial } from '../domain';
import { TutorialCard } from './TutorialCard';
import styles from './TutorialsPage.module.css';

export interface TutorialsResultsProps {
  readonly tutorials: readonly Tutorial[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly isAdmin: boolean;
  readonly removingId: string | null;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
}

/** Loading / error / empty / grid states for the tutorials library. */
export const TutorialsResults = ({
  tutorials,
  isLoading,
  error,
  isAdmin,
  removingId,
  onWatch,
  onEdit,
  onDelete,
}: TutorialsResultsProps): ReactElement => {
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading tutorials" />
      </div>
    );
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load tutorials">
        {error.message}
      </Alert>
    );
  }
  if (tutorials.length === 0) {
    return (
      <EmptyState title="No tutorials match" description="Try a different search." />
    );
  }
  return (
    <div className={styles.grid}>
      {tutorials.map((tutorial) => (
        <TutorialCard
          key={tutorial.id}
          tutorial={tutorial}
          isAdmin={isAdmin}
          isBusy={tutorial.id === removingId}
          onWatch={onWatch}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
