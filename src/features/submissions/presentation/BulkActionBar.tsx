import type { ReactElement } from 'react';
import { CheckCheck } from 'lucide-react';
import { Button } from '@shared/ui';
import { useMyCapabilities } from '@features/users';
import styles from './ApprovalsPage.module.css';

export interface BulkActionBarProps {
  readonly count: number;
  readonly busy: boolean;
  readonly onApprove: () => void;
  readonly onClear: () => void;
}

/** Appears when submissions are selected — approve them all or clear the selection. */
export const BulkActionBar = ({
  count,
  busy,
  onApprove,
  onClear,
}: BulkActionBarProps): ReactElement | null => {
  const { can } = useMyCapabilities();
  if (count === 0) {
    return null;
  }
  return (
    <div className={styles.bulkBar}>
      <span className={styles.bulkCount}>{count} selected</span>
      <div className={styles.bulkActions}>
        <Button size="sm" variant="ghost" onClick={onClear}>
          Clear
        </Button>
        {can('approvals', 'approve') ? (
          <Button size="sm" disabled={busy} onClick={onApprove}>
            <CheckCheck size={14} aria-hidden="true" /> Approve selected
          </Button>
        ) : null}
      </div>
    </div>
  );
};
