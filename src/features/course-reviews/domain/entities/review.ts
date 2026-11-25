export interface ReviewProps {
  readonly id: string;
  readonly contentId: string;
  readonly contentName: string;
  readonly userId: string;
  readonly userName: string;
  readonly userRole: string;
  readonly rating: number;
  readonly feedback: string;
  readonly createdAt: Date;
  readonly helpful: number;
  readonly isHelpful?: boolean;
}

/**
 * A learner's review of content. Immutable. Identity is deterministic — `contentId:userId` — which
 * encodes the "one review per user per content" invariant: re-submitting overwrites rather than
 * duplicating. Business questions ("is this mine?") are answered here, not in components.
 */
export class Review {
  public readonly id: string;
  public readonly contentId: string;
  public readonly contentName: string;
  public readonly userId: string;
  public readonly userName: string;
  public readonly userRole: string;
  public readonly rating: number;
  public readonly feedback: string;
  public readonly createdAt: Date;
  public readonly helpful: number;
  public readonly isHelpful: boolean;

  public constructor(props: ReviewProps) {
    this.id = props.id;
    this.contentId = props.contentId;
    this.contentName = props.contentName;
    this.userId = props.userId;
    this.userName = props.userName;
    this.userRole = props.userRole;
    this.rating = props.rating;
    this.feedback = props.feedback;
    this.createdAt = props.createdAt;
    this.helpful = Math.max(0, Math.round(props.helpful));
    this.isHelpful = props.isHelpful ?? false;
  }

  /** The deterministic id for a given content + user (enforces one-per-user-per-content). */
  public static idFor(contentId: string, userId: string): string {
    return `${contentId}:${userId}`;
  }

  public isBy(userId: string): boolean {
    return this.userId === userId;
  }

  public withHelpful(helpful: number, isHelpful?: boolean): Review {
    return new Review({
      ...this.toProps(),
      helpful,
      isHelpful: isHelpful ?? this.isHelpful,
    });
  }

  private toProps(): ReviewProps {
    return {
      id: this.id,
      contentId: this.contentId,
      contentName: this.contentName,
      userId: this.userId,
      userName: this.userName,
      userRole: this.userRole,
      rating: this.rating,
      feedback: this.feedback,
      createdAt: this.createdAt,
      helpful: this.helpful,
      isHelpful: this.isHelpful,
    };
  }
}
