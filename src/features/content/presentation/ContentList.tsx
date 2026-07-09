import type { ReactElement } from 'react';
import { EmptyState } from '@shared/ui';
import type { ContentItem } from '../domain';
import { ContentRow } from './ContentRow';
import styles from './ContentManagementPage.module.css';

export interface ContentListProps {
  readonly items: readonly ContentItem[];
  readonly busyId: string | null;
  readonly onPublish: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

/** Renders the filtered list of content rows, or an empty placeholder. */
export const ContentList = ({
  items,
  busyId,
  onPublish,
  onDelete,
}: ContentListProps): ReactElement => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No content here"
        description="Nothing matches this filter yet."
      />
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ContentRow
          key={item.id}
          item={item}
          isBusy={busyId === item.id}
          onPublish={onPublish}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
