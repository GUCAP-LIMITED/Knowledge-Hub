export type TeamMemberStatus = 'online' | 'offline' | 'away';

export type TeamMemberBucket = 'on-track' | 'in-progress' | 'at-risk';

export interface TeamMemberProps {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  /** Overall learning progress (0–100). */
  readonly progress: number;
  readonly completed: number;
  readonly total: number;
  readonly lastActive: string;
  readonly status: TeamMemberStatus;
}

/**
 * A member of the current user's team. Immutable: every field is fixed at construction so the
 * presentation layer can rely on reference equality. Business questions ("are they on track?")
 * are answered by the entity via {@link TeamMember.bucket} — never by a component or store.
 */
export class TeamMember {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly role: string;
  public readonly progress: number;
  public readonly completed: number;
  public readonly total: number;
  public readonly lastActive: string;
  public readonly status: TeamMemberStatus;

  public constructor(props: TeamMemberProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.role = props.role;
    this.progress = clampProgress(props.progress);
    this.completed = props.completed;
    this.total = props.total;
    this.lastActive = props.lastActive;
    this.status = props.status;
  }

  /** Classify the member's standing from their progress (>=75 on-track, >=40 in-progress). */
  public bucket(): TeamMemberBucket {
    if (this.progress >= 75) {
      return 'on-track';
    }
    if (this.progress >= 40) {
      return 'in-progress';
    }
    return 'at-risk';
  }
}

const clampProgress = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));
