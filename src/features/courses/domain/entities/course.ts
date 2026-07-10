export interface CourseProps {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly duration: string;
  readonly lessons: number;
  readonly mandatory: boolean;
  readonly rating: number;
  readonly enrolled: number;
  readonly addedDate: Date;
  readonly outcomes: readonly string[];
  /** Per-learner progress projection (0–100), merged in for the current user. */
  readonly progress: number;
  readonly description?: string;
  /** Uploaded content file (data URL) that replaces the demo media, or null. */
  readonly mediaUrl?: string | null;
  /** Uploaded cover image (data URL), or null. */
  readonly thumbnailUrl?: string | null;
}

/** The admin-editable subset of a course's details. Media fields are optional (kept if omitted). */
export interface CourseDetailsPatch {
  readonly title: string;
  readonly category: string;
  readonly duration: string;
  readonly mandatory: boolean;
  readonly description: string;
  readonly mediaUrl?: string;
  readonly thumbnailUrl?: string;
}

/**
 * A learning course. Immutable: a progress change returns a new `Course` so the presentation layer
 * can rely on reference equality for cache updates. Business questions ("is this complete?",
 * "has the learner started?") are answered by the entity — never by a component or store.
 */
export class Course {
  public readonly id: string;
  public readonly title: string;
  public readonly category: string;
  public readonly duration: string;
  public readonly lessons: number;
  public readonly mandatory: boolean;
  public readonly rating: number;
  public readonly enrolled: number;
  public readonly addedDate: Date;
  public readonly outcomes: readonly string[];
  public readonly progress: number;
  public readonly description: string;
  public readonly mediaUrl: string | null;
  public readonly thumbnailUrl: string | null;

  public constructor(props: CourseProps) {
    this.id = props.id;
    this.title = props.title;
    this.category = props.category;
    this.duration = props.duration;
    this.lessons = props.lessons;
    this.mandatory = props.mandatory;
    this.rating = props.rating;
    this.enrolled = props.enrolled;
    this.addedDate = props.addedDate;
    this.outcomes = props.outcomes;
    this.progress = clampProgress(props.progress);
    this.description = props.description ?? '';
    this.mediaUrl = props.mediaUrl ?? null;
    this.thumbnailUrl = props.thumbnailUrl ?? null;
  }

  /** True once the learner has finished every lesson. */
  public isCompleted(): boolean {
    return this.progress >= 100;
  }

  /** True once the learner has started (enrolled and made any progress). */
  public hasStarted(): boolean {
    return this.progress > 0;
  }

  /** Whether this course is eligible to issue a certificate (completed). */
  public isCertificateEligible(): boolean {
    return this.isCompleted();
  }

  /** Return a copy with an explicit progress value (clamped to 0–100). */
  public withProgress(progress: number): Course {
    return new Course({ ...this.toProps(), progress: clampProgress(progress) });
  }

  /** Return a copy with edited display details (title, category, duration, mandatory). */
  public withDetails(patch: CourseDetailsPatch): Course {
    return new Course({ ...this.toProps(), ...patch });
  }

  private toProps(): CourseProps {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      duration: this.duration,
      lessons: this.lessons,
      mandatory: this.mandatory,
      rating: this.rating,
      enrolled: this.enrolled,
      addedDate: this.addedDate,
      outcomes: this.outcomes,
      progress: this.progress,
      description: this.description,
      mediaUrl: this.mediaUrl,
      thumbnailUrl: this.thumbnailUrl,
    };
  }
}

const clampProgress = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));
