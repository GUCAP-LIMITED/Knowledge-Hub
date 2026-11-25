/* eslint-disable max-lines-per-function, complexity */
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Send, ShieldAlert, Rocket } from 'lucide-react';
import { Badge, Button } from '@shared/ui';
import type { ContentDetail } from '@features/content';
import { useMyPermissions, hasPermissionGrant } from '@features/permissions';
import { ApprovalsPermissions } from './approvals-permissions';
import { useDraftEditor } from './use-draft-editor';
import styles from './ReviewStudioHeader.module.css';

export interface ReviewStudioHeaderProps {
  readonly content: ContentDetail;
  readonly submitterName?: string | undefined;
  readonly status?: number | undefined;
  readonly submittedAt?: string | null | undefined;
  readonly reviewNote?: string | null | undefined;
  readonly reviewedByName?: string | null | undefined;
  readonly isRevision: boolean;
  readonly isReviewable: boolean;
  readonly isNewSubmission: boolean;
  readonly isApproving: boolean;
  readonly isPublishing: boolean;
  readonly isFlagging: boolean;
  readonly isRejecting: boolean;
  readonly onApprove: () => void;
  readonly onApproveAndPublish?: () => void;
  readonly onPublish?: () => void;
  readonly onFlag?: () => void;
  readonly onReject: () => void;
}

const resolveFeedbackMessage = (
  rawNote: string | null | undefined,
  reviewedByName: string | null | undefined,
): string | null => {
  const note = rawNote?.trim();
  const reviewer = reviewedByName?.trim();

  if (reviewer && reviewer.length > 0) {
    if (
      !note ||
      note.toLowerCase() === 'approved by reviewer' ||
      note.toLowerCase() === 'approved'
    ) {
      return `Approved by ${reviewer}`;
    }
    if (/^approved by reviewer/i.test(note)) {
      return note.replace(/^approved by reviewer/i, `Approved by ${reviewer}`);
    }
    return `${note} (by ${reviewer})`;
  }

  return note && note.length > 0 ? note : null;
};

const getStatusLabel = (
  status: number,
): { label: string; tone: 'warning' | 'info' | 'success' | 'danger' } => {
  switch (status) {
    case 5:
      return { label: 'Pending Review', tone: 'warning' };
    case 10:
      return { label: 'In Review', tone: 'info' };
    case 15:
      return { label: 'Approved', tone: 'success' };
    case 20:
      return { label: 'Published', tone: 'success' };
    case 25:
      return { label: 'Changes Requested', tone: 'danger' };
    default:
      return { label: 'Draft', tone: 'warning' };
  }
};

export const ReviewStudioHeader = ({
  content,
  submitterName,
  status,
  submittedAt,
  reviewNote,
  reviewedByName,
  isRevision,
  isReviewable,
  isNewSubmission,
  isApproving,
  isPublishing,
  isFlagging,
  isRejecting,
  onApprove,
  onApproveAndPublish,
  onPublish,
  onFlag,
  onReject,
}: ReviewStudioHeaderProps): ReactElement => {
  const navigate = useNavigate();
  const { contentTypeKey, draftState } = useDraftEditor();
  const typeLabel =
    contentTypeKey === 'course'
      ? 'Course'
      : contentTypeKey === 'tutorial'
        ? 'Tutorial'
        : 'Resource';

  const currentStatus = status ?? (isRevision ? 5 : content.status);
  const statusMeta = getStatusLabel(currentStatus);
  const queueTab = isRevision ? 'revisions' : 'submissions';

  const { data: permissions } = useMyPermissions();
  const canApprove = hasPermissionGrant(permissions, ApprovalsPermissions.Approve);
  const canReject = hasPermissionGrant(permissions, ApprovalsPermissions.Reject);
  const canPublish = hasPermissionGrant(permissions, ApprovalsPermissions.Publish);

  const busy = isApproving || isPublishing || isFlagging || isRejecting;
  const displayedDate = submittedAt ?? content.submittedAt;
  const displayedFeedback = resolveFeedbackMessage(
    reviewNote ?? content.reviewNote,
    reviewedByName ?? content.reviewedByName,
  );

  return (
    <div className={styles.wrapper}>
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigate(`/approvals?tab=${queueTab}`);
          }}
        >
          <ArrowLeft aria-hidden="true" /> Back to Approval Queue
        </Button>
      </div>

      <div className={styles.headerRow}>
        <div>
          <div className={styles.badgeRow}>
            <Badge tone="primary" size="sm">
              {typeLabel.toUpperCase()}
            </Badge>
            {isRevision && (
              <Badge tone="neutral" size="sm">
                REVISION
              </Badge>
            )}
            <Badge tone={statusMeta.tone} size="sm">
              {statusMeta.label}
            </Badge>
          </div>

          <h1 className={styles.title}>{draftState.details.title || content.title}</h1>

          <div className={styles.metaRow}>
            <span>
              Submitted by:{' '}
              <strong>
                {submitterName ??
                  content.submittedByName ??
                  content.ownerName ??
                  'Author'}
              </strong>
            </span>
            <span>•</span>
            <span className={styles.metaDate}>
              <Clock size={13} />
              {displayedDate
                ? new Date(displayedDate).toLocaleDateString()
                : 'Recently submitted'}
            </span>
          </div>
        </div>

        {isReviewable && (
          <div className={styles.actions}>
            {canApprove && isNewSubmission && content.status === 5 && onFlag && (
              <Button variant="outline" size="sm" onClick={onFlag} disabled={busy}>
                <Send size={14} /> Move to In Review
              </Button>
            )}

            {canReject && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                disabled={busy}
                className={styles.rejectButton}
              >
                <ShieldAlert size={14} /> Reject
              </Button>
            )}

            {canPublish && isNewSubmission && content.status === 15 && onPublish && (
              <Button variant="default" size="sm" onClick={onPublish} disabled={busy}>
                <Rocket size={14} />
                {isPublishing ? 'Publishing...' : 'Publish Now'}
              </Button>
            )}

            {isNewSubmission && content.status !== 15 && (
              <>
                {canApprove && (
                  <Button variant="outline" size="sm" onClick={onApprove} disabled={busy}>
                    <CheckCircle2 size={14} />
                    {isApproving && !isPublishing ? 'Approving...' : 'Approve'}
                  </Button>
                )}
                {canApprove && canPublish && onApproveAndPublish && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onApproveAndPublish}
                    disabled={busy}
                  >
                    <Rocket size={14} />
                    {isApproving || isPublishing ? 'Publishing...' : 'Approve & Publish'}
                  </Button>
                )}
              </>
            )}

            {isRevision && canApprove && canPublish && (
              <Button variant="default" size="sm" onClick={onApprove} disabled={busy}>
                <Rocket size={14} />
                {isApproving ? 'Publishing...' : 'Approve & Publish'}
              </Button>
            )}
          </div>
        )}
      </div>

      {Boolean(displayedFeedback) && (
        <div className={styles.feedbackBanner}>
          <strong>Previous Feedback:</strong>
          <span>{displayedFeedback}</span>
        </div>
      )}
    </div>
  );
};
