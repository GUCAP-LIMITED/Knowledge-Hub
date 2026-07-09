/** The lifecycle a training assignment moves through. */
export type AssignmentStatus = 'active' | 'completed' | 'overdue';

export interface AssignmentProps {
  readonly id: string;
  /** The title of the course being assigned. */
  readonly course: string;
  /** The person or group the training is assigned to. */
  readonly assignee: string;
  readonly dueDate: Date;
  readonly status: AssignmentStatus;
}

/**
 * A training assignment. Immutable: the presentation layer relies on reference equality for cache
 * updates. Business questions ("is this overdue?") are answered by the entity — never by a
 * component or store.
 */
export class Assignment {
  public readonly id: string;
  public readonly course: string;
  public readonly assignee: string;
  public readonly dueDate: Date;
  public readonly status: AssignmentStatus;

  public constructor(props: AssignmentProps) {
    this.id = props.id;
    this.course = props.course;
    this.assignee = props.assignee;
    this.dueDate = props.dueDate;
    this.status = props.status;
  }

  /** True when the assignment is not yet completed and its due date has passed. */
  public isOverdue(now: Date): boolean {
    return this.status !== 'completed' && this.dueDate < now;
  }
}
