export interface ReviewProps {
  readonly id: string;
  readonly courseId: string;
  readonly courseName: string;
  readonly userId: string;
  readonly userName: string;
  readonly userRole: string;
  readonly rating: number;
  readonly feedback: string;
  readonly createdAt: Date;
  readonly helpful: number;
}

/**
 * A learner's review of a course. Immutable. Identity is deterministic — `courseId:userId` — which
 * encodes the "one review per user per course" invariant: re-submitting overwrites rather than
 * duplicating. Business questions ("is this mine?") are answered here, not in components.
 */
export class Review {
  public readonly id: string;
  public readonly courseId: string;
  public readonly courseName: string;
  public readonly userId: string;
  public readonly userName: string;
  public readonly userRole: string;
  public readonly rating: number;
  public readonly feedback: string;
  public readonly createdAt: Date;
  public readonly helpful: number;

  public constructor(props: ReviewProps) {
    this.id = props.id;
    this.courseId = props.courseId;
    this.courseName = props.courseName;
    this.userId = props.userId;
    this.userName = props.userName;
    this.userRole = props.userRole;
    this.rating = props.rating;
    this.feedback = props.feedback;
    this.createdAt = props.createdAt;
    this.helpful = Math.max(0, Math.round(props.helpful));
  }

  /** The deterministic id for a given course + user (enforces one-per-user-per-course). */
  public static idFor(courseId: string, userId: string): string {
    return `${courseId}:${userId}`;
  }

  public isBy(userId: string): boolean {
    return this.userId === userId;
  }

  public withHelpful(helpful: number): Review {
    return new Review({ ...this.toProps(), helpful });
  }

  private toProps(): ReviewProps {
    return {
      id: this.id,
      courseId: this.courseId,
      courseName: this.courseName,
      userId: this.userId,
      userName: this.userName,
      userRole: this.userRole,
      rating: this.rating,
      feedback: this.feedback,
      createdAt: this.createdAt,
      helpful: this.helpful,
    };
  }
}
