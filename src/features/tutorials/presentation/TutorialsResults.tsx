import type { ReactElement } from 'react';
import { SearchX } from 'lucide-react';
import { Alert, CardGridSkeleton, EmptyState } from '@shared/ui';
import type { Tutorial } from '../domain';
import { TutorialCard } from './TutorialCard';
import styles from './TutorialsPage.module.css';

export interface TutorialsResultsProps {
  readonly tutorials: readonly Tutorial[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  /** True when a search or filter is narrowing the list (changes the empty message). */
  readonly filtered: boolean;
  readonly removingId: string | null;
  readonly onWatch: (tutorial: Tutorial) => void;
  readonly onEdit: (tutorial: Tutorial) => void;
  readonly onDelete: (id: string) => void;
  readonly onQuiz: (tutorial: Tutorial) => void;
}

/** Loading / error / empty / grid states for the tutorials library. */
export const TutorialsResults = ({
  tutorials,
  isLoading,
  error,
  filtered,
  removingId,
  onWatch,
  onEdit,
  onDelete,
  onQuiz,
}: TutorialsResultsProps): ReactElement => {
  if (isLoading) {
    return <CardGridSkeleton />;
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load tutorials">
        {error.message}
      </Alert>
    );
  }
  if (tutorials.length === 0) {
    return filtered ? (
      <EmptyState
        icon={SearchX}
        title="No tutorials match"
        description="Try a different search term or category."
      />
    ) : (
      <EmptyState
        title="No tutorials yet"
        description="Tutorials will appear here once they're published."
      />
    );
  }
  return (
    <div className={styles.grid}>
      {tutorials.map((tutorial) => (
        <TutorialCard
          key={tutorial.id}
          tutorial={tutorial}
          isBusy={tutorial.id === removingId}
          onWatch={onWatch}
          onEdit={onEdit}
          onDelete={onDelete}
          onQuiz={onQuiz}
        />
      ))}
    </div>
  );
};
