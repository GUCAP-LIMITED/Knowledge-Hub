import type { ReactElement } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge, IconButton } from '@shared/ui';
import type { ContentItem } from '../domain';
import { ContentStatusBadge } from './ContentStatusBadge';
import styles from './ContentManagementPage.module.css';

export interface ContentTableRowProps {
  readonly item: ContentItem;
  readonly isBusy: boolean;
  readonly onEdit: (item: ContentItem) => void;
  readonly onDelete: (id: string) => void;
}

/** One row of the content table: title, type, status, author, created, views, actions. */
export const ContentTableRow = ({
  item,
  isBusy,
  onEdit,
  onDelete,
}: ContentTableRowProps): ReactElement => (
  <tr className={styles.tr}>
    <td className={styles.cellTitle}>{item.title}</td>
    <td className={styles.cell}>
      <Badge tone="info">{item.type}</Badge>
    </td>
    <td className={styles.cell}>
      <ContentStatusBadge status={item.status} />
    </td>
    <td className={styles.cellMuted}>{item.author}</td>
    <td className={styles.cellSubtle}>{item.createdAt.toLocaleDateString('en-GB')}</td>
    <td className={styles.cellViews}>{item.views.toLocaleString()}</td>
    <td className={styles.cell}>
      <div className={styles.rowActions}>
        <IconButton
          label="Edit content"
          disabled={isBusy}
          onClick={() => {
            onEdit(item);
          }}
        >
          <Pencil size={16} />
        </IconButton>
        <IconButton
          label="Delete content"
          variant="danger"
          disabled={isBusy}
          onClick={() => {
            onDelete(item.id);
          }}
        >
          <Trash2 size={16} />
        </IconButton>
      </div>
    </td>
  </tr>
);
