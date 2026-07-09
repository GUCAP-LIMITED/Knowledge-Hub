import { useEffect, useState, type ReactElement } from 'react';
import { CheckCircle, FileText, X } from 'lucide-react';
import { Alert, Button, Modal, Textarea } from '@shared/ui';
import type { Submission } from '../domain';
import { SubmissionTimeline } from './SubmissionTimeline';
import styles from './ReviewSubmissionModal.module.css';

type Decision = 'approve' | 'reject' | null;

const PreviewBlock = ({
  submission,
}: {
  readonly submission: Submission;
}): ReactElement => (
  <div>
    <div className={styles.previewLabel}>Preview</div>
    <div className={styles.preview}>
      <FileText size={34} aria-hidden="true" className={styles.previewIcon} />
      <div className={styles.previewTitle}>{submission.title}</div>
      <div className={styles.previewType}>{submission.type}</div>
    </div>
    {submission.note !== null ? (
      <div className={styles.reviewerNote}>
        <span className={styles.reviewerNoteLabel}>Reviewer note</span>
        <p className={styles.reviewerNoteText}>{submission.note}</p>
      </div>
    ) : null}
  </div>
);

const DecisionForm = ({
  decision,
  note,
  onNote,
  error,
}: {
  readonly decision: 'approve' | 'reject';
  readonly note: string;
  readonly onNote: (value: string) => void;
  readonly error?: string | undefined;
}): ReactElement => (
  <div>
    <h3 className={styles.decisionTitle}>
      {decision === 'approve' ? 'Approve this submission' : 'Reject this submission'}
    </h3>
    <p className={styles.decisionHint}>
      {decision === 'approve'
        ? 'Add an optional note before approving.'
        : 'A rejection reason is required so the author understands the decision.'}
    </p>
    {error !== undefined ? (
      <Alert tone="error" title="Could not reject">
        {error}
      </Alert>
    ) : null}
    <Textarea
      label={decision === 'approve' ? 'Reviewer note (optional)' : 'Rejection reason'}
      value={note}
      rows={5}
      placeholder={
        decision === 'approve' ? 'Optional note…' : 'Why is this being rejected?'
      }
      onChange={(event) => {
        onNote(event.target.value);
      }}
    />
  </div>
);

interface ReviewFooterProps {
  readonly submission: Submission;
  readonly decision: Decision;
  readonly note: string;
  readonly isBusy: boolean;
  readonly onSetDecision: (decision: Decision) => void;
  readonly onApprove: (id: string, note: string) => void;
  readonly onReject: (id: string, reason: string) => void;
  readonly onFlag: (id: string) => void;
  readonly onClose: () => void;
}

const ReviewFooter = ({
  submission,
  decision,
  note,
  isBusy,
  onSetDecision,
  onApprove,
  onReject,
  onFlag,
  onClose,
}: ReviewFooterProps): ReactElement => {
  if (decision === null) {
    return (
      <>
        {submission.status === 'pending' ? (
          <Button
            variant="ghost"
            onClick={() => {
              onFlag(submission.id);
              onClose();
            }}
          >
            Send to review
          </Button>
        ) : null}
        <Button
          variant="danger"
          onClick={() => {
            onSetDecision('reject');
          }}
        >
          <X size={14} aria-hidden="true" /> Reject
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onSetDecision('approve');
          }}
        >
          <CheckCircle size={14} aria-hidden="true" /> Approve
        </Button>
      </>
    );
  }
  const canConfirm = decision === 'approve' || note.trim().length > 0;
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          onSetDecision(null);
        }}
      >
        Back
      </Button>
      <Button
        variant={decision === 'approve' ? 'primary' : 'danger'}
        isLoading={isBusy}
        disabled={!canConfirm}
        onClick={() => {
          if (decision === 'approve') {
            onApprove(submission.id, note.trim());
          } else {
            onReject(submission.id, note.trim());
          }
        }}
      >
        {decision === 'approve' ? 'Confirm approve' : 'Confirm reject'}
      </Button>
    </>
  );
};

export interface ReviewSubmissionModalProps {
  readonly submission: Submission | null;
  readonly isBusy: boolean;
  readonly rejectError?: string | undefined;
  readonly onClose: () => void;
  readonly onApprove: (id: string, note: string) => void;
  readonly onReject: (id: string, reason: string) => void;
  readonly onFlag: (id: string) => void;
}

/** Rich review modal: preview + decision (approve/reject with required reason) + timeline. */
export const ReviewSubmissionModal = ({
  submission,
  isBusy,
  rejectError,
  onClose,
  onApprove,
  onReject,
  onFlag,
}: ReviewSubmissionModalProps): ReactElement => {
  const [decision, setDecision] = useState<Decision>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    setDecision(null);
    setNote('');
  }, [submission?.id]);

  return (
    <Modal
      open={submission !== null}
      size="lg"
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title={submission?.title ?? 'Submission'}
      description={
        submission !== null
          ? `Submitted by ${submission.submittedBy} · ${submission.submittedAt.toLocaleDateString()}`
          : undefined
      }
      footer={
        submission?.awaitsDecision() === true ? (
          <ReviewFooter
            submission={submission}
            decision={decision}
            note={note}
            isBusy={isBusy}
            onSetDecision={setDecision}
            onApprove={onApprove}
            onReject={onReject}
            onFlag={onFlag}
            onClose={onClose}
          />
        ) : undefined
      }
    >
      {submission !== null ? (
        <div className={styles.body}>
          <div className={styles.left}>
            {decision !== null ? (
              <DecisionForm
                decision={decision}
                note={note}
                onNote={setNote}
                error={rejectError}
              />
            ) : (
              <PreviewBlock submission={submission} />
            )}
          </div>
          <SubmissionTimeline submission={submission} />
        </div>
      ) : null}
    </Modal>
  );
};
