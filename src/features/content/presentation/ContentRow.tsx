import type { ReactElement } from 'react';
import { Badge, Button } from '@shared/ui';
import type { ContentItem } from '../domain';
import { ContentStatusBadge } from './ContentStatusBadge';
import styles from './ContentManagementPage.module.css';

export interface ContentRowProps {
  readonly item: ContentItem;
  readonly isBusy: boolean;
  readonly onPublish: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

/** A single content line: title + type + status + metadata, with publish/delete actions. */
export const ContentRow = ({
  item,
  isBusy,
  onPublish,
  onDelete,
}: ContentRowProps): ReactElement => (
  <article className={styles.row}>
    <div className={styles.info}>
      <h3 className={styles.rowTitle}>{item.title}</h3>
      <div className={styles.badges}>
        <Badge tone="info">{item.type}</Badge>
        <ContentStatusBadge status={item.status} />
      </div>
      <p className={styles.meta}>
        {item.author} · {item.createdAt.toLocaleDateString()} ·{' '}
        {item.views.toLocaleString()} views
      </p>
    </div>
    <div className={styles.actions}>
      {item.isPublished() ? null : (
        <Button
          size="sm"
          isLoading={isBusy}
          onClick={() => {
            onPublish(item.id);
          }}
        >
          Publish
        </Button>
      )}
      <Button
        size="sm"
        variant="danger"
        disabled={isBusy}
        onClick={() => {
          onDelete(item.id);
        }}
      >
        Delete
      </Button>
    </div>
  </article>
);
