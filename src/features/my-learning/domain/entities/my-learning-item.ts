import type {
  AssignedScopeKey,
  ContentTypeKey,
  LearningOriginKey,
  MyLearningStatusKey,
} from '../types';

export interface MyLearningItemProps {
  readonly id: string;
  readonly slug?: string | null | undefined;
  readonly assignmentId: string | null;
  readonly enrollmentId: string | null;
  readonly title: string;
  readonly subtitle: string | null;
  readonly description: string | null;
  readonly contentType: ContentTypeKey;
  readonly contentTypeName: string;
  readonly origin: LearningOriginKey;
  readonly originName: string;
  readonly assignedScope: AssignedScopeKey | null;
  readonly assignedScopeName: string | null;
  readonly status: MyLearningStatusKey;
  readonly statusName: string;
  readonly progress: number;
  readonly dueDate: Date | null;
  readonly isOverdue: boolean;
  readonly daysRemaining: number | null;
  readonly enrolledOrAssignedAt: Date;
  readonly lastAccessedAt: Date | null;
  readonly completedAt: Date | null;
  readonly totalLessons: number;
  readonly completedLessons: number;
  readonly durationSeconds: number;
  readonly difficultyName: string;
  readonly categoryName: string | null;
  readonly topic: string | null;
  readonly thumbnailUrl: string | null;
  readonly certificateId: string | null;
  readonly certificateUrl: string | null;
  readonly isAccessible?: boolean | undefined;
  readonly isPublished?: boolean | undefined;
  readonly helpfulCount?: number | undefined;
  readonly rating?: number | undefined;
  readonly totalReviews?: number | undefined;
  readonly actionLabel: string;
}

export class MyLearningItem {
  public readonly id: string;
  public readonly slug: string | null;
  public readonly assignmentId: string | null;
  public readonly enrollmentId: string | null;
  public readonly title: string;
  public readonly subtitle: string | null;
  public readonly description: string | null;
  public readonly contentType: ContentTypeKey;
  public readonly contentTypeName: string;
  public readonly origin: LearningOriginKey;
  public readonly originName: string;
  public readonly assignedScope: AssignedScopeKey | null;
  public readonly assignedScopeName: string | null;
  public readonly status: MyLearningStatusKey;
  public readonly statusName: string;
  public readonly progress: number;
  public readonly dueDate: Date | null;
  public readonly isOverdue: boolean;
  public readonly daysRemaining: number | null;
  public readonly enrolledOrAssignedAt: Date;
  public readonly lastAccessedAt: Date | null;
  public readonly completedAt: Date | null;
  public readonly totalLessons: number;
  public readonly completedLessons: number;
  public readonly durationSeconds: number;
  public readonly difficultyName: string;
  public readonly categoryName: string | null;
  public readonly topic: string | null;
  public readonly thumbnailUrl: string | null;
  public readonly certificateId: string | null;
  public readonly certificateUrl: string | null;
  public readonly isAccessible: boolean;
  public readonly isPublished: boolean;
  public readonly helpfulCount: number;
  public readonly rating: number;
  public readonly totalReviews: number;
  public readonly actionLabel: string;

  public constructor(props: MyLearningItemProps) {
    this.id = props.id;
    this.slug = props.slug ?? null;
    this.assignmentId = props.assignmentId;
    this.enrollmentId = props.enrollmentId;
    this.title = props.title;
    this.subtitle = props.subtitle;
    this.description = props.description;
    this.contentType = props.contentType;
    this.contentTypeName = props.contentTypeName;
    this.origin = props.origin;
    this.originName = props.originName;
    this.assignedScope = props.assignedScope;
    this.assignedScopeName = props.assignedScopeName;
    this.status = props.status;
    this.statusName = props.statusName;
    this.progress = Math.max(0, Math.min(100, props.progress));
    this.dueDate = props.dueDate;
    this.isOverdue = props.isOverdue;
    this.daysRemaining = props.daysRemaining;
    this.enrolledOrAssignedAt = props.enrolledOrAssignedAt;
    this.lastAccessedAt = props.lastAccessedAt;
    this.completedAt = props.completedAt;
    this.totalLessons = props.totalLessons;
    this.completedLessons = props.completedLessons;
    this.durationSeconds = props.durationSeconds;
    this.difficultyName = props.difficultyName;
    this.categoryName = props.categoryName;
    this.topic = props.topic;
    this.thumbnailUrl = props.thumbnailUrl;
    this.certificateId = props.certificateId;
    this.certificateUrl = props.certificateUrl;
    this.isAccessible = props.isAccessible ?? true;
    this.isPublished = props.isPublished ?? true;
    this.helpfulCount = Math.max(0, Math.round(props.helpfulCount ?? 0));
    const rawRating = props.rating;
    this.rating = Math.max(
      0,
      Math.min(
        5,
        typeof rawRating === 'number' && Number.isFinite(rawRating) ? rawRating : 0,
      ),
    );
    this.totalReviews = Math.max(0, Math.round(props.totalReviews ?? 0));
    this.actionLabel = props.actionLabel;
  }

  public isCompleted(): boolean {
    return this.status === 'completed' || this.progress >= 100;
  }

  public isAssigned(): boolean {
    return this.origin === 'assigned';
  }

  public isSelf(): boolean {
    return this.origin === 'self';
  }

  public isCourse(): boolean {
    return this.contentType === 'course';
  }

  public isTutorial(): boolean {
    return this.contentType === 'tutorial';
  }

  public isResource(): boolean {
    return this.contentType === 'resource';
  }

  public formattedDuration(): string {
    if (this.durationSeconds <= 0) {
      return '';
    }
    const hours = Math.floor(this.durationSeconds / 3600);
    const minutes = Math.floor((this.durationSeconds % 3600) / 60);
    if (hours > 0) {
      return `${String(hours)}h ${String(minutes)}m`;
    }
    return `${String(minutes)}m`;
  }
}
