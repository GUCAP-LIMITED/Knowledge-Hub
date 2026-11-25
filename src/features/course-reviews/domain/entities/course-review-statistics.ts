export interface RatingBreakdown {
  readonly fiveStars: number;
  readonly fourStars: number;
  readonly threeStars: number;
  readonly twoStars: number;
  readonly oneStar: number;
}

export interface TopRatedCourseProps {
  readonly courseId: string;
  readonly title: string;
  readonly slug: string;
  readonly averageRating: number;
  readonly totalReviews: number;
  readonly totalHelpfulVotes: number;
  readonly thumbnailUrl: string | null;
}

export class TopRatedCourse {
  public readonly courseId: string;
  public readonly title: string;
  public readonly slug: string;
  public readonly averageRating: number;
  public readonly totalReviews: number;
  public readonly totalHelpfulVotes: number;
  public readonly thumbnailUrl: string | null;

  public constructor(props: TopRatedCourseProps) {
    this.courseId = props.courseId;
    this.title = props.title;
    this.slug = props.slug;
    this.averageRating = props.averageRating;
    this.totalReviews = props.totalReviews;
    this.totalHelpfulVotes = props.totalHelpfulVotes;
    this.thumbnailUrl = props.thumbnailUrl;
  }
}

export interface CourseReviewStatisticsProps {
  readonly totalReviews: number;
  readonly averageRating: number;
  readonly totalRatedCourses: number;
  readonly totalHelpfulVotes: number;
  readonly ratingBreakdown: RatingBreakdown;
  readonly topRatedCourses: readonly TopRatedCourse[];
}

export class CourseReviewStatistics {
  public readonly totalReviews: number;
  public readonly averageRating: number;
  public readonly totalRatedCourses: number;
  public readonly totalHelpfulVotes: number;
  public readonly ratingBreakdown: RatingBreakdown;
  public readonly topRatedCourses: readonly TopRatedCourse[];

  public constructor(props: CourseReviewStatisticsProps) {
    this.totalReviews = props.totalReviews;
    this.averageRating = props.averageRating;
    this.totalRatedCourses = props.totalRatedCourses;
    this.totalHelpfulVotes = props.totalHelpfulVotes;
    this.ratingBreakdown = props.ratingBreakdown;
    this.topRatedCourses = props.topRatedCourses;
  }
}
