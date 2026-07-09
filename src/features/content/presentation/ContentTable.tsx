import type { ReactElement } from 'react';
import type { ContentItem } from '../domain';
import { ContentTableRow } from './ContentTableRow';
import styles from './ContentManagementPage.module.css';

export interface ContentTableProps {
  readonly items: readonly ContentItem[];
  readonly busyId: string | null;
  readonly onEdit: (item: ContentItem) => void;
  readonly onDelete: (id: string) => void;
}

const HEADERS: readonly string[] = [
  'Title',
  'Type',
  'Status',
  'Author',
  'Created',
  'Views',
  '',
];

/** Desktop table of every content item with per-row edit/delete actions. */
export const ContentTable = ({
  items,
  busyId,
  onEdit,
  onDelete,
}: ContentTableProps): ReactElement => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          {HEADERS.map((header, index) => (
            <th
              key={header === '' ? `col-${String(index)}` : header}
              className={styles.th}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <ContentTableRow
            key={item.id}
            item={item}
            isBusy={busyId === item.id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  </div>
);
