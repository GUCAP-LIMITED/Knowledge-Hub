import type { ReactElement } from 'react';
import { Button, Modal } from '@shared/ui';
import type { Assignment } from '../domain';
import styles from './AssignTrainingPage.module.css';

export interface ViewProgressModalProps {
  readonly assignment: Assignment | null;
  readonly onClose: () => void;
}

/** Read-only modal summarising an assignment's status. */
export const ViewProgressModal = ({
  assignment,
  onClose,
}: ViewProgressModalProps): ReactElement => {
  const contentTypeName = assignment?.contentTypeName ?? 'Training';
  const targetCount = String(assignment?.assignees.length ?? 0);
  const dueStr = assignment?.dueDate.toLocaleDateString() ?? '';
  const description =
    assignment !== null
      ? `${contentTypeName} · Assigned to ${targetCount} target(s) · Due ${dueStr}`
      : undefined;

  return (
    <Modal
      open={assignment !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={assignment ? assignment.contentTitle : 'Assignment'}
      description={description}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {assignment !== null ? (
        <p className={styles.note}>
          Current status: <strong>{assignment.status}</strong>. Progress for this
          assignment is tracked across enrolled learners. Check the{' '}
          {assignment.contentTypeName.toLowerCase()} details page for in-depth analytics.
        </p>
      ) : null}
    </Modal>
  );
};
