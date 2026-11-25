import { formatNotificationTopic } from '../format-topic';

const ACTION_LABELS: Readonly<Record<string, string>> = {
  review_submission: 'Review Submission',
  view_review_studio: 'Review Submission',
  inspect_diff: 'Inspect Diff & Review',
  view_revision_diff: 'Inspect Diff & Review',
  view_proposed_changes: 'View Proposed Changes',
  view_live: 'View Live Content',
  edit_submission: 'Edit & Resubmit',
  edit_revision: 'Update Draft Revision',
  view_draft: 'View Draft Status',
  view_staged_changes: 'View Staged Changes',
  view_assignment: 'View My Learning',
  view_assignments: 'View Assignments',
  complete_now: 'Complete Now',
  open_training: 'Open Training',
  view_team_status: 'View Team Status',
  view_certificate: 'View Certificate',
  view_progress: 'View Progress',
};

const resolveActionLabel = (action: unknown): string => {
  if (typeof action === 'string') {
    const label = ACTION_LABELS[action];
    if (label !== undefined) {
      return label;
    }
  }
  return 'View';
};

export const normalizeRoute = (rawRoute: string): string => {
  const editMatch = /^\/content\/([0-9a-fA-F-]+)\/edit/.exec(rawRoute);
  const editId = editMatch?.[1];
  if (editId) {
    return `/submissions/${editId}/edit`;
  }

  const reviewStudioRevMatch =
    /^\/content\/review-studio\/([0-9a-fA-F-]+).*revisionId=([0-9a-fA-F-]+)/.exec(
      rawRoute,
    );
  const revContentId = reviewStudioRevMatch?.[1];
  const revId = reviewStudioRevMatch?.[2];
  if (revContentId && revId) {
    return `/approvals/review/${revContentId}/${revId}`;
  }

  const reviewStudioMatch = /^\/content\/review-studio\/([0-9a-fA-F-]+)/.exec(rawRoute);
  const studioId = reviewStudioMatch?.[1];
  if (studioId) {
    return `/approvals/review/${studioId}`;
  }

  if (rawRoute === '/training-assignments') {
    return '/assign';
  }

  return rawRoute;
};

export type AnnouncementPriority = 'high' | 'medium' | 'normal' | 'low';

export interface AnnouncementAction {
  readonly route: string;
  readonly actionText: string;
  readonly kind?: string | undefined;
}

export interface AnnouncementProps {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly priority: AnnouncementPriority;
  readonly author: string;
  readonly date: string;
  readonly read: boolean;
  readonly topicId?: string | undefined;
  readonly extra?: string | undefined;
}

/**
 * A broadcast announcement / notification. Immutable — marking it read returns a new instance so the presentation
 * layer can rely on reference equality for cache updates.
 */
export class Announcement {
  public readonly id: string;
  public readonly title: string;
  public readonly content: string;
  public readonly priority: AnnouncementPriority;
  public readonly author: string;
  public readonly date: string;
  public readonly read: boolean;
  public readonly topicId?: string | undefined;
  public readonly extra?: string | undefined;

  public constructor(props: AnnouncementProps) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
    this.priority = props.priority;
    this.author = props.author;
    this.date = props.date;
    this.read = props.read;
    this.topicId = props.topicId;
    this.extra = props.extra;
  }

  public isUnread(): boolean {
    return !this.read;
  }

  public markRead(): Announcement {
    return new Announcement({ ...this.toProps(), read: true });
  }

  public getFormattedTopic(): string {
    return formatNotificationTopic(this.topicId);
  }

  /**
   * Safely parses the extra JSON payload to extract deep-link routing and action metadata.
   */
  public getAction(): AnnouncementAction | null {
    if (!this.extra) {
      return null;
    }
    try {
      const parsed = JSON.parse(this.extra) as Record<string, unknown>;
      if (typeof parsed.route !== 'string' || parsed.route.length === 0) {
        return null;
      }
      return {
        route: normalizeRoute(parsed.route),
        actionText: resolveActionLabel(parsed.action),
        kind: typeof parsed.kind === 'string' ? parsed.kind : undefined,
      };
    } catch {
      return null;
    }
  }

  private toProps(): AnnouncementProps {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      priority: this.priority,
      author: this.author,
      date: this.date,
      read: this.read,
      topicId: this.topicId,
      extra: this.extra,
    };
  }
}
