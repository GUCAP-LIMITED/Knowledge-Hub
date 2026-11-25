export type CourseLessonKind = 'video' | 'pdf' | 'quiz' | 'assignment' | 'link';

/** Sentinel category used when the backend has not classified a course yet. */
export const UNCATEGORIZED_LABEL = 'Uncategorized';

export interface CourseLessonAttachment {
  readonly id: string;
  readonly mediaAssetId: string;
  readonly role: number | string;
  readonly displayOrder: number;
  readonly originalFileName?: string;
  readonly mimeType?: string | null;
  readonly sizeBytes?: number;
  readonly url?: string | null;
  readonly streamStatus?: number | null;
}

export interface CourseLesson {
  readonly id: string;
  readonly title: string;
  readonly durationSeconds: number;
  readonly kind: CourseLessonKind;
  readonly displayOrder?: number;
  readonly mediaAssetId: string | null;
  readonly quizId: string | null;
  readonly externalUrl: string | null;
  readonly isPreview?: boolean;
  readonly attachments?: readonly CourseLessonAttachment[];
}

export interface CourseSection {
  readonly id: string;
  readonly title: string;
  readonly displayOrder?: number;
  readonly lessons: readonly CourseLesson[];
}

export interface CourseMediaAsset {
  readonly id: string;
  readonly slot?: number | undefined;
  readonly kind?: number | undefined;
  readonly originalFileName?: string | undefined;
  readonly mimeType?: string | null | undefined;
  readonly sizeBytes?: number | undefined;
  readonly url?: string | null | undefined;
  readonly referencedLessonId?: string | null | undefined;
  readonly azureBlobName?: string | null | undefined;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseIntroMedia {
  readonly url: string;
  readonly mimeType: string | null;
  readonly durationSeconds: number;
}

export interface CourseProps {
  readonly id: string;
  readonly slug?: string | undefined;
  readonly title: string;
  readonly subtitle?: string | null | undefined;
  readonly category: string;
  readonly categoryId?: string | null;
  readonly difficulty?: Difficulty;
  readonly duration: string;
  readonly durationSeconds?: number;
  readonly lessons: number;
  readonly mandatory: boolean;
  readonly rating: number;
  readonly totalReviews?: number;
  readonly enrolled: number;
  readonly addedDate: Date;
  /** Last-modified timestamp; falls back to `addedDate` when the backend doesn't report one. */
  readonly updatedAt?: Date;
  readonly outcomes: readonly string[];
  /** True if the current user is enrolled in this course. */
  readonly isEnrolled: boolean;
  /** The enrollment ID, if the current user is enrolled. */
  readonly enrollmentId?: string | null;
  /** The enrollment status of the current user. */
  readonly enrollmentStatus?: number | null;
  /** List of completed lesson IDs for the current user. */
  readonly completedLessons?: readonly string[];
  /** Per-learner progress projection (0–100), merged in for the current user. */
  readonly progress: number;
  readonly description?: string;
  readonly sections?: readonly CourseSection[];
  /** Uploaded content file (data URL) that replaces the demo media, or null. */
  readonly mediaUrl?: string | null;
  /** Uploaded cover image (data URL), or null. */
  readonly thumbnailUrl?: string | null;
  /** Intro/preview video for the course, if the backend provided one. */
  readonly introMedia?: CourseIntroMedia | null;
  /** Server-reported completion flag; falls back to `progress >= 100` when omitted. */
  readonly completed?: boolean;
  /** ISO timestamp the course was completed, if known. */
  readonly completedAt?: string | null;
  /** Issued certificate ID, once the course is completed. */
  readonly certificateId?: string | null;
  /** Downloadable/viewable certificate URL, once the course is completed. */
  readonly certificateUrl?: string | null;
  readonly helpfulCount?: number;
  readonly isHelpful?: boolean;
  readonly canModify?: boolean;
  readonly media?: readonly CourseMediaAsset[] | undefined;
}

/** The admin-editable subset of a course's details. Media fields are optional (kept if omitted). */
export interface CourseDetailsPatch {
  readonly title: string;
  readonly category: string;
  readonly categoryId?: string | null;
  readonly difficulty?: Difficulty;
  readonly duration: string;
  readonly durationSeconds?: number;
  readonly mandatory?: boolean;
  readonly description: string;
  readonly mediaUrl?: string;
  readonly thumbnailUrl?: string;
}

interface CourseEnrollmentDetails {
  readonly enrollmentId: string | null;
  readonly enrollmentStatus: number | null;
  readonly completedLessons: readonly string[];
}

const resolveEnrollment = (props: CourseProps): CourseEnrollmentDetails => ({
  enrollmentId: props.enrollmentId ?? null,
  enrollmentStatus: props.enrollmentStatus ?? null,
  completedLessons: props.completedLessons ?? [],
});

interface CourseCompletion {
  readonly completed: boolean;
  readonly completedAt: string | null;
  readonly certificateId: string | null;
  readonly certificateUrl: string | null;
}

const resolveCompletion = (props: CourseProps, progress: number): CourseCompletion => ({
  completed: props.completed ?? progress >= 100,
  completedAt: props.completedAt ?? null,
  certificateId: props.certificateId ?? null,
  certificateUrl: props.certificateUrl ?? null,
});

interface CourseContentDetails {
  readonly description: string;
  readonly mediaUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly introMedia: CourseIntroMedia | null;
  readonly sections: readonly CourseSection[];
}

const resolveContent = (props: CourseProps): CourseContentDetails => ({
  description: props.description ?? '',
  mediaUrl: props.mediaUrl ?? null,
  thumbnailUrl: props.thumbnailUrl ?? null,
  introMedia: props.introMedia ?? null,
  sections: props.sections ?? [],
});

interface CourseFeedback {
  readonly helpfulCount: number;
  readonly isHelpful: boolean;
  readonly totalReviews: number;
}

const resolveFeedback = (props: CourseProps): CourseFeedback => ({
  helpfulCount: Math.max(0, Math.round(props.helpfulCount ?? 0)),
  isHelpful: props.isHelpful ?? false,
  totalReviews: Math.max(0, Math.round(props.totalReviews ?? 0)),
});

/**
 * A learning course. Immutable: a progress change returns a new `Course` so the presentation layer
 * can rely on reference equality for cache updates. Business questions ("is this complete?",
 * "has the learner started?") are answered by the entity — never by a component or store.
 */
export class Course {
  public readonly id: string;
  public readonly slug: string;
  public readonly title: string;
  public readonly subtitle: string | null;
  public readonly category: string;
  public readonly categoryId: string | null;
  public readonly difficulty: Difficulty;
  public readonly duration: string;
  public readonly durationSeconds: number;
  public readonly lessons: number;
  public readonly mandatory: boolean;
  public readonly rating: number;
  public readonly enrolled: number;
  public readonly addedDate: Date;
  public readonly updatedAt: Date;
  public readonly outcomes: readonly string[];
  public readonly isEnrolled: boolean;
  public readonly enrollmentId: string | null;
  public readonly enrollmentStatus: number | null;
  public readonly completedLessons: readonly string[];
  public readonly progress: number;
  public readonly description: string;
  public readonly mediaUrl: string | null;
  public readonly thumbnailUrl: string | null;
  public readonly introMedia: CourseIntroMedia | null;
  public readonly sections: readonly CourseSection[];
  public readonly completed: boolean;
  public readonly completedAt: string | null;
  public readonly certificateId: string | null;
  public readonly certificateUrl: string | null;
  public readonly helpfulCount: number;
  public readonly isHelpful: boolean;
  public readonly totalReviews: number;
  public readonly canModify: boolean;
  public readonly media: readonly CourseMediaAsset[];

  public constructor(props: CourseProps) {
    this.id = props.id;
    this.slug = props.slug ?? props.id;
    this.title = props.title;
    this.subtitle = props.subtitle ?? null;
    this.category = props.category;
    this.categoryId = props.categoryId ?? null;
    this.difficulty = props.difficulty ?? 'Beginner';
    this.duration = props.duration;
    this.durationSeconds = props.durationSeconds ?? 0;
    this.lessons = props.lessons;
    this.mandatory = props.mandatory;
    this.rating = props.rating;
    this.enrolled = props.enrolled;
    this.addedDate = props.addedDate;
    this.updatedAt = resolveUpdatedAt(props);
    this.outcomes = props.outcomes;
    this.isEnrolled = props.isEnrolled;
    const enrollment = resolveEnrollment(props);
    this.enrollmentId = enrollment.enrollmentId;
    this.enrollmentStatus = enrollment.enrollmentStatus;
    this.completedLessons = enrollment.completedLessons;
    this.progress = Math.max(0, Math.min(100, props.progress));
    const content = resolveContent(props);
    this.description = content.description;
    this.mediaUrl = content.mediaUrl;
    this.thumbnailUrl = content.thumbnailUrl;
    this.introMedia = content.introMedia;
    this.sections = content.sections;
    const completion = resolveCompletion(props, this.progress);
    this.completed = completion.completed;
    this.completedAt = completion.completedAt;
    this.certificateId = completion.certificateId;
    this.certificateUrl = completion.certificateUrl;
    const feedback = resolveFeedback(props);
    this.helpfulCount = feedback.helpfulCount;
    this.isHelpful = feedback.isHelpful;
    this.totalReviews = feedback.totalReviews;
    this.canModify = props.canModify ?? false;
    this.media = props.media ?? [];
  }

  /** True once the learner has finished every lesson. Server-reported when available. */
  public isCompleted(): boolean {
    return this.completed;
  }

  /** True once the learner has started (enrolled and made any progress). */
  public hasStarted(): boolean {
    return this.progress > 0;
  }

  /** Whether this course is eligible to issue a certificate (completed). */
  public isCertificateEligible(): boolean {
    return this.isCompleted();
  }

  /** True if the enrollment is paused. */
  public isPaused(): boolean {
    return this.enrollmentStatus === 10;
  }

  /** True once this course has received at least one rating. */
  public hasRating(): boolean {
    return this.rating > 0;
  }

  /** Return a copy with an explicit progress value (clamped to 0–100). */
  public withProgress(progress: number): Course {
    return new Course({ ...this.toProps(), progress: clampProgress(progress) });
  }

  /** Return a copy with edited display details (title, category, duration, mandatory). */
  public withDetails(patch: CourseDetailsPatch): Course {
    return new Course({ ...this.toProps(), ...patch });
  }

  /** Return a copy with updated helpful count and voter flag. */
  public withHelpfulVote(helpfulCount: number, isHelpful: boolean): Course {
    return new Course({
      ...this.toProps(),
      helpfulCount: Math.max(0, Math.round(helpfulCount)),
      isHelpful,
    });
  }

  private toProps(): CourseProps {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      category: this.category,
      categoryId: this.categoryId,
      difficulty: this.difficulty,
      duration: this.duration,
      durationSeconds: this.durationSeconds,
      lessons: this.lessons,
      mandatory: this.mandatory,
      rating: this.rating,
      enrolled: this.enrolled,
      addedDate: this.addedDate,
      updatedAt: this.updatedAt,
      outcomes: this.outcomes,
      isEnrolled: this.isEnrolled,
      enrollmentId: this.enrollmentId,
      enrollmentStatus: this.enrollmentStatus,
      completedLessons: this.completedLessons,
      progress: this.progress,
      description: this.description,
      mediaUrl: this.mediaUrl,
      thumbnailUrl: this.thumbnailUrl,
      introMedia: this.introMedia,
      sections: this.sections,
      completed: this.completed,
      completedAt: this.completedAt,
      certificateId: this.certificateId,
      certificateUrl: this.certificateUrl,
      helpfulCount: this.helpfulCount,
      isHelpful: this.isHelpful,
      totalReviews: this.totalReviews,
      canModify: this.canModify,
      media: this.media,
    };
  }
}

const resolveUpdatedAt = (props: CourseProps): Date => props.updatedAt ?? props.addedDate;

const clampProgress = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));
