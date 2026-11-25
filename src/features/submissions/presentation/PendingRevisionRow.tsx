import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, FileEdit } from 'lucide-react';
import { Badge, Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { ContentRevision } from '@features/content';
import styles from './SubmissionRow.module.css';

export type RevisionStatusType = 'pending' | 'review' | 'approved' | 'rejected';

export interface PendingRevisionRowProps {
  readonly revision: ContentRevision;
  readonly statusType: RevisionStatusType;
}

interface ParsedPayload {
  readonly title: string;
  readonly typeTag: string | null;
}

const parsePayload = (revision: ContentRevision): ParsedPayload => {
  let title = `Content ID: ${revision.contentItemId}`;
  let typeTag: string | null = null;
  try {
    const payload = JSON.parse(revision.payloadJson) as {
      details?: { title?: string };
      curriculum?: { sections?: unknown[] };
      media?: unknown[];
    };
    if (payload.details?.title) {
      title = payload.details.title;
    }
    if (payload.curriculum && Array.isArray(payload.curriculum.sections)) {
      typeTag = 'Course';
    } else if (payload.media) {
      typeTag = 'Media / Asset';
    }
  } catch {
    // Ignore parse error
  }
  return { title, typeTag };
};

const resolveStatusLabel = (
  statusType: RevisionStatusType,
  creationTime: string,
): string => {
  if (statusType === 'approved') return 'Approved';
  if (statusType === 'rejected') return 'Rejected';

  const days = Math.floor((Date.now() - new Date(creationTime).getTime()) / 86_400_000);
  return days <= 0 ? 'Submitted today' : `Waiting for ${String(days)}d`;
};

const STATUS_TONE_CLASS: Readonly<Record<RevisionStatusType, string | undefined>> = {
  pending: styles.waiting,
  review: styles.waiting,
  approved: styles.statusApproved,
  rejected: styles.statusRejected,
};

export const PendingRevisionRow = ({
  revision,
  statusType,
}: PendingRevisionRowProps): ReactElement => {
  const navigate = useNavigate();
  const { title, typeTag } = parsePayload(revision);
  const statusLabel = resolveStatusLabel(statusType, revision.creationTime);
  const isDecision = statusType === 'pending' || statusType === 'review';
  const authorLabel = revision.authorName ?? revision.authorId.substring(0, 8);

  return (
    <article className={styles.row}>
      <div className={styles.lead}>
        <span className={styles.iconTile}>
          <FileEdit size={20} aria-hidden="true" />
        </span>
        <div className={styles.info}>
          <div className={styles.titleLine}>
            <h3 className={styles.title}>{title}</h3>
            {typeTag !== null ? (
              <Badge tone="primary" size="sm">
                {typeTag}
              </Badge>
            ) : null}
          </div>
          <div className={styles.metaChips}>
            <span className={cn(styles.waiting, STATUS_TONE_CLASS[statusType])}>
              <Clock size={12} aria-hidden="true" /> {statusLabel}
            </span>
            <span className={styles.metaDate}>
              Author: {authorLabel} ·{' '}
              {new Date(revision.creationTime).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          size="sm"
          variant={isDecision ? 'default' : 'outline'}
          onClick={() => {
            navigate(`/approvals/review/${revision.contentItemId}/${revision.id}`);
          }}
        >
          <Eye size={14} aria-hidden="true" />{' '}
          {isDecision ? 'Review Draft' : 'View Content'}
        </Button>
      </div>
    </article>
  );
};
