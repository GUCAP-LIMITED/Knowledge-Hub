export interface RecentReviewProps {
  readonly id: string;
  readonly contentItemId: string;
  readonly courseTitle: string;
  readonly courseSlug: string;
  readonly courseThumbnailUrl: string | null;
  readonly userId: string;
  readonly reviewerName: string;
  readonly reviewerEmail: string | null;
  readonly rating: number;
  readonly feedback: string;
  readonly helpfulCount: number;
  readonly creationTime: Date;
  readonly isHelpful?: boolean;
}

/**
 * A course review item from the recent reviews feed with enriched course and reviewer details.
 */
export class RecentReview {
  public readonly id: string;
  public readonly contentItemId: string;
  public readonly courseTitle: string;
  public readonly courseSlug: string;
  public readonly courseThumbnailUrl: string | null;
  public readonly userId: string;
  public readonly reviewerName: string;
  public readonly reviewerEmail: string | null;
  public readonly rating: number;
  public readonly feedback: string;
  public readonly helpfulCount: number;
  public readonly creationTime: Date;
  public readonly isHelpful: boolean;

  public constructor(props: RecentReviewProps) {
    this.id = props.id;
    this.contentItemId = props.contentItemId;
    this.courseTitle = props.courseTitle;
    this.courseSlug = props.courseSlug;
    this.courseThumbnailUrl = props.courseThumbnailUrl;
    this.userId = props.userId;
    this.reviewerName = props.reviewerName;
    this.reviewerEmail = props.reviewerEmail;
    this.rating = props.rating;
    this.feedback = props.feedback;
    this.helpfulCount = Math.max(0, Math.round(props.helpfulCount));
    this.creationTime = props.creationTime;
    this.isHelpful = props.isHelpful ?? false;
  }

  public get courseId(): string {
    return this.contentItemId;
  }

  public get helpful(): number {
    return this.helpfulCount;
  }

  public withHelpful(helpfulCount: number, isHelpful?: boolean): RecentReview {
    return new RecentReview({
      id: this.id,
      contentItemId: this.contentItemId,
      courseTitle: this.courseTitle,
      courseSlug: this.courseSlug,
      courseThumbnailUrl: this.courseThumbnailUrl,
      userId: this.userId,
      reviewerName: this.reviewerName,
      reviewerEmail: this.reviewerEmail,
      rating: this.rating,
      feedback: this.feedback,
      helpfulCount,
      creationTime: this.creationTime,
      isHelpful: isHelpful ?? this.isHelpful,
    });
  }
}
