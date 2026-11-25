import type { AssignmentAssignee } from '../value-objects/assignee';

/** The lifecycle a training assignment moves through. */
export type AssignmentStatus = 'active' | 'completed' | 'overdue';

export type ContentTypeKey = 'course' | 'tutorial' | 'resource';
export type AssignmentContentType = ContentTypeKey;

export interface AssignmentProps {
  readonly id: string;
  /** The ID of the content item (course, tutorial, or resource) being assigned. */
  readonly contentItemId: string;
  /** The display name of the content item being assigned. */
  readonly contentTitle: string;
  /** The type of content (course, tutorial, or resource). */
  readonly contentType?: ContentTypeKey | undefined;
  /** The human-readable name of the content type. */
  readonly contentTypeName?: string | undefined;
  /** The list of assignees (teams, user types, or emails). */
  readonly assignees: readonly AssignmentAssignee[];
  readonly dueDate: Date;
  readonly status: AssignmentStatus;
  /** Aggregate completion across the assignees (0–100). */
  readonly progress: number;
}

const clampPct = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

/**
 * A training assignment. Immutable: the presentation layer relies on reference equality for cache
 * updates. Business questions ("is this overdue?") are answered by the entity — never by a
 * component or store.
 */
export class Assignment {
  public readonly id: string;
  public readonly contentItemId: string;
  public readonly contentTitle: string;
  public readonly contentType: ContentTypeKey;
  public readonly contentTypeName: string;
  public readonly assignees: readonly AssignmentAssignee[];
  public readonly dueDate: Date;
  public readonly status: AssignmentStatus;
  public readonly progress: number;

  public constructor(props: AssignmentProps) {
    this.id = props.id;
    this.contentItemId = props.contentItemId;
    this.contentTitle = props.contentTitle;
    this.contentType = props.contentType ?? 'course';
    this.contentTypeName = props.contentTypeName ?? 'Course';
    this.assignees = props.assignees;
    this.dueDate = props.dueDate;
    this.status = props.status;
    this.progress = clampPct(props.progress);
  }

  /** Backwards compatibility alias for contentItemId. */
  public get courseId(): string {
    return this.contentItemId;
  }

  /** Backwards compatibility alias for contentTitle. */
  public get courseTitle(): string {
    return this.contentTitle;
  }

  /** True when the assignment is not yet completed and its due date has passed. */
  public isOverdue(now: Date): boolean {
    return this.status !== 'completed' && this.dueDate < now;
  }
}
