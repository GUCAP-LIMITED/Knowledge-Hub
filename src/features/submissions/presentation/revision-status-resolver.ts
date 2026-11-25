import {
  CONTENT_STATUS,
  type ContentDetail,
  type ContentRevision,
} from '@features/content';

export interface RevisionStatusInfo {
  readonly isRemoteDraft: boolean;
  readonly isPendingReview: boolean;
  readonly isRejected: boolean;
  readonly reviewerNotes: string | null;
  readonly statusText: string;
}

const resolveRemoteDraftStatus = (revision: ContentRevision): RevisionStatusInfo => {
  const isPendingReview = revision.status === CONTENT_STATUS.pendingReview;
  const isRejected = revision.status === CONTENT_STATUS.rejected;

  let statusText = 'Unpublished Draft';
  if (isPendingReview) {
    statusText = 'In Review';
  } else if (isRejected) {
    statusText = 'Changes Requested';
  }

  return {
    isRemoteDraft: true,
    isPendingReview,
    isRejected,
    reviewerNotes: revision.reviewerNotes ?? null,
    statusText,
  };
};

const resolveContentItemStatusText = (status?: number): string => {
  switch (status) {
    case CONTENT_STATUS.pendingReview:
      return 'Pending Review';
    case CONTENT_STATUS.inReview:
      return 'In Review';
    case CONTENT_STATUS.approved:
      return 'Approved';
    case CONTENT_STATUS.rejected:
      return 'Changes Requested';
    case CONTENT_STATUS.draft:
      return 'Draft';
    case undefined:
    default:
      return 'Live Content';
  }
};

const resolveContentItemStatus = (content?: ContentDetail | null): RevisionStatusInfo => {
  const status = content?.status;
  const isPendingReview =
    status === CONTENT_STATUS.pendingReview || status === CONTENT_STATUS.inReview;
  const isRejected = status === CONTENT_STATUS.rejected;

  return {
    isRemoteDraft: false,
    isPendingReview,
    isRejected,
    reviewerNotes: content?.reviewNote ?? null,
    statusText: resolveContentItemStatusText(status),
  };
};

const isRevision = (
  item: ContentDetail | ContentRevision | null | undefined,
): item is ContentRevision => Boolean(item && 'payloadJson' in item);

export const resolveRevisionStatus = (
  contentOrRevision?: ContentDetail | ContentRevision | null,
  maybeRevision?: ContentRevision | null,
): RevisionStatusInfo => {
  if (maybeRevision) {
    return resolveRemoteDraftStatus(maybeRevision);
  }

  if (isRevision(contentOrRevision)) {
    return resolveRemoteDraftStatus(contentOrRevision);
  }

  return resolveContentItemStatus(contentOrRevision);
};
