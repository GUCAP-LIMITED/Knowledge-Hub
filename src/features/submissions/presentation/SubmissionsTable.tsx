import type { ReactElement } from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@shared/ui';
import type { Submission } from '../domain';
import { StatusBadge } from './StatusBadge';
import styles from './SubmissionsPage.module.css';

const HEADERS: readonly string[] = ['Document', 'Type', 'Date', 'Status'];

const Row = ({ submission }: { readonly submission: Submission }): ReactElement => (
  <tr className={styles.tr}>
    <td className={styles.cell}>
      <div className={styles.docCell}>
        <FileText size={16} aria-hidden="true" className={styles.docIcon} />
        <span className={styles.docTitle}>{submission.title}</span>
      </div>
    </td>
    <td className={styles.cell}>
      <Badge tone="info">{submission.type}</Badge>
    </td>
    <td className={styles.cellMuted}>
      {submission.submittedAt.toLocaleDateString('en-GB')}
    </td>
    <td className={styles.cell}>
      <StatusBadge status={submission.status} />
    </td>
  </tr>
);

export interface SubmissionsTableProps {
  readonly submissions: readonly Submission[];
}

/** Desktop table of submissions: document, type, date, status, and a view action. */
export const SubmissionsTable = ({
  submissions,
}: SubmissionsTableProps): ReactElement => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          {HEADERS.map((header) => (
            <th
              key={header}
              className={header === 'Actions' ? styles.thRight : styles.th}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission) => (
          <Row key={submission.id} submission={submission} />
        ))}
      </tbody>
    </table>
  </div>
);
