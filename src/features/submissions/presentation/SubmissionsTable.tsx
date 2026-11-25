import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { Badge, IconButton, useDeleteConfirm } from '@shared/ui';
import { cn } from '@shared/utils';
import { useDeleteContent } from '@features/content';
import { useMyPermissions } from '@features/permissions';
import type { Submission } from '../domain';
import { StatusBadge } from './StatusBadge';
import { useCategoryNameLookup } from './use-category-lookup';
import styles from './SubmissionsPage.module.css';

const UNCATEGORIZED_LABEL = 'Uncategorized';

interface ColumnDef {
  readonly label: string;
  readonly widthClass: string | undefined;
  readonly alignRight?: boolean;
}

/** Fixed column widths (sum to 100%) so the table never reflows as row content changes. */
const BASE_COLUMNS: readonly ColumnDef[] = [
  { label: 'Document', widthClass: styles.colDocument },
  { label: 'Type', widthClass: styles.colType },
  { label: 'Category', widthClass: styles.colCategory },
  { label: 'Date', widthClass: styles.colDate },
  { label: 'Status', widthClass: styles.colStatus },
];

const ACTIONS_COLUMN: ColumnDef = {
  label: 'Actions',
  widthClass: styles.colActions,
  alignRight: true,
};

const resolveCategoryName = (
  categoryId: string | null,
  categoryNames: ReadonlyMap<string, string>,
): string => {
  if (categoryId === null) {
    return UNCATEGORIZED_LABEL;
  }
  return categoryNames.get(categoryId) ?? UNCATEGORIZED_LABEL;
};

const Row = ({
  submission,
  categoryNames,
  canEdit,
  canDelete,
  hasActions,
  isDeleting,
  onEdit,
  onDelete,
}: {
  readonly submission: Submission;
  readonly categoryNames: ReadonlyMap<string, string>;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly hasActions: boolean;
  readonly isDeleting: boolean;
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
}): ReactElement => {
  const categoryLabel = resolveCategoryName(submission.categoryId, categoryNames);
  const rowCanEdit = canEdit && submission.canModify;
  const rowCanDelete = canDelete && submission.canModify;
  return (
    <tr className={styles.tr}>
      <td className={styles.cell} data-label="Document">
        <div className={styles.docCell}>
          <FileText size={16} aria-hidden="true" className={styles.docIcon} />
          <span className={styles.docTitle} title={submission.title}>
            {submission.title}
          </span>
        </div>
      </td>
      <td className={styles.cell} data-label="Type">
        <Badge tone="info">{submission.type}</Badge>
      </td>
      <td className={cn(styles.cellMuted, styles.truncate)} data-label="Category">
        <span title={categoryLabel}>{categoryLabel}</span>
      </td>
      <td className={styles.cellMuted} data-label="Date">
        {submission.submittedAt.toLocaleDateString('en-GB')}
      </td>
      <td className={styles.cell} data-label="Status">
        <StatusBadge status={submission.status} />
      </td>
      {hasActions ? (
        <td className={styles.cellRight} data-label="Actions">
          <div className={styles.actionsCell}>
            {rowCanEdit ? (
              <IconButton
                label="Edit submission"
                onClick={() => {
                  onEdit(submission.id);
                }}
              >
                <Pencil size={15} aria-hidden="true" />
              </IconButton>
            ) : null}
            {rowCanDelete ? (
              <IconButton
                label="Delete submission"
                variant="danger"
                disabled={isDeleting}
                onClick={() => {
                  onDelete(submission.id);
                }}
              >
                <Trash2 size={15} aria-hidden="true" />
              </IconButton>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  );
};

export interface SubmissionsTableProps {
  readonly submissions: readonly Submission[];
}

/** Desktop table of submissions: document, type, category, date, status, and edit/delete actions. */
export const SubmissionsTable = ({
  submissions,
}: SubmissionsTableProps): ReactElement => {
  const navigate = useNavigate();
  const deleteContent = useDeleteContent();
  const { data: permissions } = useMyPermissions();
  const canEdit = permissions?.['MySubmissions.Edit'] === true;
  const canDelete = permissions?.['MySubmissions.Delete'] === true;
  const anyCanModify = submissions.some((submission) => submission.canModify);
  const hasActions = (canEdit || canDelete) && anyCanModify;
  const columns = hasActions ? [...BASE_COLUMNS, ACTIONS_COLUMN] : BASE_COLUMNS;
  const categoryNames = useCategoryNameLookup();

  const del = useDeleteConfirm(
    submissions.map((submission) => ({ id: submission.id, title: submission.title })),
    'document',
    (id) => {
      deleteContent.mutate(id);
    },
    deleteContent.isPending,
  );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                className={cn(
                  column.alignRight ? styles.thRight : styles.th,
                  column.widthClass,
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <Row
              key={submission.id}
              submission={submission}
              categoryNames={categoryNames}
              canEdit={canEdit}
              canDelete={canDelete}
              hasActions={hasActions}
              isDeleting={deleteContent.isPending}
              onEdit={(id) => {
                navigate(`/submissions/${id}/edit`);
              }}
              onDelete={del.request}
            />
          ))}
        </tbody>
      </table>
      {del.dialog}
    </div>
  );
};
