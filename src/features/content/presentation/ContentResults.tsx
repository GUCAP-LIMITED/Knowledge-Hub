import type { ReactElement } from 'react';
import { Alert, Button, EmptyState, Spinner } from '@shared/ui';
import type { ContentItem } from '../domain';
import { ContentTable } from './ContentTable';
import styles from './ContentManagementPage.module.css';

export interface ContentResultsProps {
  readonly items: readonly ContentItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly busyId: string | null;
  readonly onEdit: (item: ContentItem) => void;
  readonly onDelete: (id: string) => void;
  readonly onClearFilters: () => void;
}

/** The loading/error/empty/table states of the content library. */
export const ContentResults = ({
  items,
  isLoading,
  error,
  busyId,
  onEdit,
  onDelete,
  onClearFilters,
}: ContentResultsProps): ReactElement => {
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load content">
        {error.message}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading content" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No matching content"
        description="Try a different search term or clear the filters."
        action={
          <Button variant="ghost" onClick={onClearFilters}>
            Clear all
          </Button>
        }
      />
    );
  }

  return (
    <ContentTable items={items} busyId={busyId} onEdit={onEdit} onDelete={onDelete} />
  );
};
