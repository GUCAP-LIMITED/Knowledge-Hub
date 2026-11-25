export interface ResourceAttachment {
  readonly id: string;
  readonly name: string;
  readonly url?: string | null | undefined;
  readonly sizeBytes?: number | undefined;
}

export interface ResourceProps {
  readonly id: string;
  readonly slug?: string | undefined;
  readonly title: string;
  readonly subtitle?: string | null | undefined;
  readonly type: string;
  readonly category: string;
  readonly categoryId?: string | null | undefined;
  readonly visibility?: string | undefined;
  readonly views: number;
  readonly helpful: number;
  readonly isHelpful?: boolean | undefined;
  readonly updated: Date;
  readonly description?: string | undefined;
  /** Uploaded content file (data URL or asset ID/url) that replaces the demo media, or null. */
  readonly mediaUrl?: string | null | undefined;
  readonly primaryMediaName?: string | undefined;
  readonly primaryMediaSizeBytes?: number | undefined;
  readonly thumbnailUrl?: string | null | undefined;
  readonly attachments?: readonly ResourceAttachment[] | undefined;
  readonly isCompleted?: boolean | undefined;
  readonly completedAt?: string | null | undefined;
  /** Issued certificate ID, once the resource is completed. */
  readonly certificateId?: string | null | undefined;
  /** Downloadable/viewable certificate URL, once the resource is completed. */
  readonly certificateUrl?: string | null | undefined;
  readonly rating?: number | undefined;
  readonly totalReviews?: number | undefined;
  readonly canModify?: boolean | undefined;
}

/** The admin-editable subset of a resource's details. Media fields are kept when omitted. */
export interface ResourceDetailsPatch {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly category: string;
  readonly categoryId?: string | null | undefined;
  readonly type: string;
  readonly description: string;
  readonly mediaUrl?: string | undefined;
  readonly thumbnailUrl?: string | undefined;
}

const clampCount = (value: number): number => Math.max(0, Math.round(value));

interface ResourceCompletion {
  readonly isCompleted: boolean;
  readonly completedAt: string | null;
  readonly certificateId: string | null;
  readonly certificateUrl: string | null;
}

const resolveCompletion = (props: ResourceProps): ResourceCompletion => ({
  isCompleted: props.isCompleted ?? false,
  completedAt: props.completedAt ?? null,
  certificateId: props.certificateId ?? null,
  certificateUrl: props.certificateUrl ?? null,
});

interface ResourceContent {
  readonly subtitle: string | null;
  readonly categoryId: string | null;
  readonly visibility: string;
  readonly description: string;
  readonly mediaUrl: string | null;
  readonly primaryMediaName: string;
  readonly thumbnailUrl: string | null;
  readonly attachments: readonly ResourceAttachment[];
}

const resolveResourceContent = (props: ResourceProps): ResourceContent => ({
  subtitle: props.subtitle ?? null,
  categoryId: props.categoryId ?? null,
  visibility: props.visibility ?? 'Public',
  description: props.description ?? '',
  mediaUrl: props.mediaUrl ?? null,
  primaryMediaName: props.primaryMediaName ?? '',
  thumbnailUrl: props.thumbnailUrl ?? null,
  attachments: props.attachments ?? [],
});

/**
 * A knowledge-base resource. Immutable: a "helpful" change returns a new `Resource` so the
 * presentation layer can rely on reference equality for cache updates. Business questions
 * ("is this popular?") are answered by the entity — never by a component or store.
 */
export class Resource {
  public readonly id: string;
  public readonly slug: string;
  public readonly title: string;
  public readonly subtitle: string | null;
  public readonly type: string;
  public readonly category: string;
  public readonly categoryId: string | null;
  public readonly visibility: string;
  public readonly views: number;
  public readonly helpful: number;
  public readonly isHelpful: boolean;
  public readonly updated: Date;
  public readonly description: string;
  public readonly mediaUrl: string | null;
  public readonly primaryMediaName: string;
  public readonly primaryMediaSizeBytes?: number | undefined;
  public readonly thumbnailUrl: string | null;
  public readonly attachments: readonly ResourceAttachment[];
  public readonly isCompleted: boolean;
  public readonly completedAt: string | null;
  public readonly certificateId: string | null;
  public readonly certificateUrl: string | null;
  public readonly rating: number;
  public readonly totalReviews: number;
  public readonly canModify: boolean;

  public constructor(props: ResourceProps) {
    this.id = props.id;
    this.slug = props.slug ?? props.id;
    this.title = props.title;
    this.type = props.type;
    this.category = props.category;
    this.views = props.views;
    this.helpful = clampCount(props.helpful);
    this.isHelpful = props.isHelpful ?? false;
    this.updated = props.updated;
    this.primaryMediaSizeBytes = props.primaryMediaSizeBytes;
    const content = resolveResourceContent(props);
    this.subtitle = content.subtitle;
    this.categoryId = content.categoryId;
    this.visibility = content.visibility;
    this.description = content.description;
    this.mediaUrl = content.mediaUrl;
    this.primaryMediaName = content.primaryMediaName;
    this.thumbnailUrl = content.thumbnailUrl;
    this.attachments = content.attachments;
    const completion = resolveCompletion(props);
    this.isCompleted = completion.isCompleted;
    this.completedAt = completion.completedAt;
    this.certificateId = completion.certificateId;
    this.certificateUrl = completion.certificateUrl;
    this.rating = Math.max(0, Math.min(5, props.rating ?? 0));
    this.totalReviews = Math.max(0, Math.round(props.totalReviews ?? 0));
    this.canModify = props.canModify ?? false;
  }

  /** True once this resource has earned a meaningful number of helpful votes. */
  public isPopular(): boolean {
    return this.helpful >= 50;
  }

  /** Return a copy with an explicit helpful count (clamped to >= 0). */
  public withHelpful(next: number): Resource {
    return new Resource({ ...this.toProps(), helpful: clampCount(next) });
  }

  /** Return a copy with updated helpful count and voter flag. */
  public withHelpfulVote(helpful: number, isHelpful: boolean): Resource {
    return new Resource({ ...this.toProps(), helpful: clampCount(helpful), isHelpful });
  }

  /** Return a copy with edited details (title, category, type, description, media). */
  public withDetails(patch: ResourceDetailsPatch): Resource {
    return new Resource({ ...this.toProps(), ...patch });
  }

  private toProps(): ResourceProps {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      type: this.type,
      category: this.category,
      categoryId: this.categoryId,
      visibility: this.visibility,
      views: this.views,
      helpful: this.helpful,
      isHelpful: this.isHelpful,
      updated: this.updated,
      description: this.description,
      mediaUrl: this.mediaUrl,
      primaryMediaName: this.primaryMediaName,
      primaryMediaSizeBytes: this.primaryMediaSizeBytes,
      thumbnailUrl: this.thumbnailUrl,
      attachments: this.attachments,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
      certificateId: this.certificateId,
      certificateUrl: this.certificateUrl,
      rating: this.rating,
      totalReviews: this.totalReviews,
      canModify: this.canModify,
    };
  }
}
