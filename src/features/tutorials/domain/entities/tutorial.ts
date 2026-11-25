/** The difficulty tiers a tutorial can be tagged with, ordered from easiest to hardest. */
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

/** A single tutorial difficulty tier. */
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface TutorialVideo {
  readonly id: string;
  readonly originalFileName: string;
  readonly title?: string | undefined;
  readonly durationSeconds?: number | undefined;
  readonly displayOrder?: number | undefined;
  readonly streamStatus?: number | undefined;
  readonly url?: string | null | undefined;
  readonly externalUrl?: string | null | undefined;
  readonly mimeType?: string | null | undefined;
  readonly sizeBytes?: number | undefined;
  readonly isMediaCompleted?: boolean | undefined;
}

export interface TutorialProps {
  readonly id: string;
  readonly slug?: string | undefined;
  readonly title: string;
  readonly subtitle?: string | null | undefined;
  readonly category: string;
  readonly categoryId?: string | null | undefined;
  readonly duration: string;
  readonly durationSeconds?: number | undefined;
  readonly views: number;
  readonly difficulty: Difficulty;
  /** One-line summary of what the tutorial covers. */
  readonly description: string;
  /** When the tutorial was last revised — the key freshness signal for a how-to library. */
  readonly updatedAt: Date;
  /** Primary media asset ID for playback streaming. */
  readonly mediaAssetId?: string | null;
  /** Uploaded content file (data URL) or media asset ID, or null. */
  readonly mediaUrl?: string | null;
  readonly thumbnailUrl?: string | null;
  readonly visibility?: string;
  readonly quizId?: string | null;
  readonly isQuizRequired?: boolean;
  /** Server-reported completion flag for the current learner. */
  readonly completed?: boolean;
  /** ISO timestamp the tutorial was completed, if known. */
  readonly completedAt?: string | null;
  /** Issued certificate ID, once the tutorial is completed. */
  readonly certificateId?: string | null;
  /** Downloadable/viewable certificate URL, once the tutorial is completed. */
  readonly certificateUrl?: string | null;
  readonly helpfulCount?: number;
  readonly isHelpful?: boolean;
  readonly rating?: number;
  readonly totalReviews?: number;
  readonly canModify?: boolean;
  readonly videos?: readonly TutorialVideo[] | undefined;

  readonly completedVideosCount?: number | undefined;
  readonly totalVideosCount?: number | undefined;
  readonly progressPercent?: number | undefined;
}

interface TutorialCompletion {
  readonly completed: boolean;
  readonly completedAt: string | null;
  readonly certificateId: string | null;
  readonly certificateUrl: string | null;
}

const resolveCompletion = (props: TutorialProps): TutorialCompletion => ({
  completed: props.completed ?? false,
  completedAt: props.completedAt ?? null,
  certificateId: props.certificateId ?? null,
  certificateUrl: props.certificateUrl ?? null,
});

interface TutorialMedia {
  readonly mediaAssetId: string | null;
  readonly mediaUrl: string | null;
  readonly thumbnailUrl: string | null;
}

const resolveTutorialMedia = (props: TutorialProps): TutorialMedia => ({
  mediaAssetId: props.mediaAssetId ?? props.mediaUrl ?? null,
  mediaUrl: props.mediaUrl ?? props.mediaAssetId ?? null,
  thumbnailUrl: props.thumbnailUrl ?? null,
});

interface TutorialEngagement {
  readonly helpfulCount: number;
  readonly isHelpful: boolean;
  readonly rating: number;
  readonly totalReviews: number;
}

const resolveTutorialEngagement = (props: TutorialProps): TutorialEngagement => ({
  helpfulCount: Math.max(0, Math.round(props.helpfulCount ?? 0)),
  isHelpful: props.isHelpful ?? false,
  rating: Math.max(0, Math.min(5, props.rating ?? 0)),
  totalReviews: Math.max(0, Math.round(props.totalReviews ?? 0)),
});

const resolveProgress = (
  props: TutorialProps,
): {
  readonly videos: readonly TutorialVideo[];

  readonly completedVideosCount: number;
  readonly totalVideosCount: number;
  readonly progressPercent: number;
} => {
  const videos = props.videos ?? [];

  const completedVideosCount =
    props.completedVideosCount ?? videos.filter((v) => v.isMediaCompleted).length;
  const totalVideosCount = props.totalVideosCount ?? videos.length;
  const progressPercent =
    props.progressPercent ??
    (totalVideosCount > 0
      ? Math.round((completedVideosCount / totalVideosCount) * 100)
      : 0);

  return {
    videos,

    completedVideosCount,
    totalVideosCount,
    progressPercent,
  };
};

/** A tutorial is treated as "recently updated" within this many days of its last revision. */
export const RECENTLY_UPDATED_DAYS = 30;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** The admin-editable subset of a tutorial's details. Media fields are kept when omitted. */
export interface TutorialDetailsPatch {
  readonly title: string;
  readonly subtitle?: string;
  readonly category: string;
  readonly categoryId?: string | null | undefined;
  readonly duration: string;
  readonly durationSeconds?: number | undefined;
  readonly difficulty: Difficulty;
  readonly description: string;
  readonly mediaAssetId?: string;
  readonly mediaUrl?: string;
  readonly thumbnailUrl?: string;
  readonly quizId?: string | null;
  readonly isQuizRequired?: boolean;
}

/**
 * A bite-sized how-to tutorial. Immutable: fields are set once at construction so the presentation
 * layer can rely on reference equality for cache updates. Business questions ("is this a good
 * starting point?") are answered by the entity — never by a component or store.
 */
export class Tutorial {
  public readonly id: string;
  public readonly slug: string;
  public readonly title: string;
  public readonly subtitle: string | null;
  public readonly category: string;
  public readonly categoryId: string | null;
  public readonly duration: string;
  public readonly durationSeconds: number;
  public readonly views: number;
  public readonly difficulty: Difficulty;
  public readonly description: string;
  public readonly updatedAt: Date;
  public readonly mediaAssetId: string | null;
  public readonly mediaUrl: string | null;
  public readonly thumbnailUrl: string | null;
  public readonly visibility: string;
  public readonly quizId: string | null;
  public readonly isQuizRequired: boolean;
  public readonly completed: boolean;
  public readonly completedAt: string | null;
  public readonly certificateId: string | null;
  public readonly certificateUrl: string | null;
  public readonly helpfulCount: number;
  public readonly isHelpful: boolean;
  public readonly rating: number;
  public readonly totalReviews: number;
  public readonly canModify: boolean;
  public readonly videos: readonly TutorialVideo[];

  public readonly completedVideosCount: number;
  public readonly totalVideosCount: number;
  public readonly progressPercent: number;

  public constructor(props: TutorialProps) {
    this.id = props.id;
    this.slug = props.slug ?? props.id;
    this.title = props.title;
    this.subtitle = props.subtitle ?? null;
    this.category = props.category;
    this.categoryId = props.categoryId ?? null;
    this.duration = props.duration;
    this.durationSeconds = Math.max(0, Math.round(props.durationSeconds ?? 0));
    this.views = props.views;
    this.difficulty = props.difficulty;
    this.description = props.description;
    this.updatedAt = props.updatedAt;
    const media = resolveTutorialMedia(props);
    this.mediaAssetId = media.mediaAssetId;
    this.mediaUrl = media.mediaUrl;
    this.thumbnailUrl = media.thumbnailUrl;
    this.visibility = props.visibility ?? 'Public';
    this.quizId = props.quizId ?? null;
    this.isQuizRequired = props.isQuizRequired ?? false;
    const completion = resolveCompletion(props);
    this.completed = completion.completed;
    this.completedAt = completion.completedAt;
    this.certificateId = completion.certificateId;
    this.certificateUrl = completion.certificateUrl;
    const engagement = resolveTutorialEngagement(props);
    this.helpfulCount = engagement.helpfulCount;
    this.isHelpful = engagement.isHelpful;
    this.rating = engagement.rating;
    this.totalReviews = engagement.totalReviews;
    this.canModify = props.canModify ?? false;
    const progress = resolveProgress(props);
    this.videos = progress.videos;

    this.completedVideosCount = progress.completedVideosCount;
    this.totalVideosCount = progress.totalVideosCount;
    this.progressPercent = progress.progressPercent;
  }

  /** True once the learner has completed this tutorial (server-reported). */
  /** True when all videos in this tutorial have been completed by the learner. */
  public get allVideosCompleted(): boolean {
    return this.videos.length > 0 && this.videos.every((v) => v.isMediaCompleted);
  }

  /** Checks if a specific video is completed. */
  public isVideoCompleted(videoId: string): boolean {
    return Boolean(this.videos.find((v) => v.id === videoId)?.isMediaCompleted);
  }

  public isCompleted(): boolean {
    return this.completed;
  }

  /** True when the tutorial is aimed at newcomers (no prior knowledge assumed). */
  public isBeginnerFriendly(): boolean {
    return this.difficulty === 'Beginner';
  }

  /** Whether the tutorial was revised recently enough to flag as fresh. */
  public isRecentlyUpdated(now: Date): boolean {
    const days = (now.getTime() - this.updatedAt.getTime()) / MS_PER_DAY;
    return days >= 0 && days <= RECENTLY_UPDATED_DAYS;
  }

  /** Return a copy with edited details (title, category, duration, difficulty, description, media, quiz). */
  public withDetails(patch: TutorialDetailsPatch): Tutorial {
    return new Tutorial({
      id: this.id,
      slug: this.slug,
      title: patch.title,
      category: patch.category,
      categoryId: patch.categoryId !== undefined ? patch.categoryId : this.categoryId,
      duration: patch.duration,
      durationSeconds: patch.durationSeconds ?? this.durationSeconds,
      views: this.views,
      difficulty: patch.difficulty,
      description: patch.description,
      updatedAt: this.updatedAt,
      mediaAssetId: patch.mediaAssetId ?? this.mediaAssetId,
      mediaUrl: patch.mediaUrl ?? this.mediaUrl,
      thumbnailUrl: patch.thumbnailUrl ?? this.thumbnailUrl,
      visibility: this.visibility,
      quizId: patch.quizId !== undefined ? patch.quizId : this.quizId,
      isQuizRequired: patch.isQuizRequired ?? this.isQuizRequired,
      completed: this.completed,
      completedAt: this.completedAt,
      certificateId: this.certificateId,
      certificateUrl: this.certificateUrl,
      helpfulCount: this.helpfulCount,
      isHelpful: this.isHelpful,
      rating: this.rating,
      totalReviews: this.totalReviews,
      canModify: this.canModify,
    });
  }

  /** Return a copy with updated helpful count and voter flag. */
  public withHelpfulVote(helpfulCount: number, isHelpful: boolean): Tutorial {
    return new Tutorial({
      ...this.toProps(),
      helpfulCount: Math.max(0, Math.round(helpfulCount)),
      isHelpful,
    });
  }

  private toProps(): TutorialProps {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      category: this.category,
      categoryId: this.categoryId,
      duration: this.duration,
      durationSeconds: this.durationSeconds,
      views: this.views,
      difficulty: this.difficulty,
      description: this.description,
      updatedAt: this.updatedAt,
      mediaAssetId: this.mediaAssetId,
      mediaUrl: this.mediaUrl,
      thumbnailUrl: this.thumbnailUrl,
      visibility: this.visibility,
      quizId: this.quizId,
      isQuizRequired: this.isQuizRequired,
      completed: this.completed,
      completedAt: this.completedAt,
      certificateId: this.certificateId,
      certificateUrl: this.certificateUrl,
      helpfulCount: this.helpfulCount,
      isHelpful: this.isHelpful,
      rating: this.rating,
      totalReviews: this.totalReviews,
      canModify: this.canModify,
      videos: this.videos,

      completedVideosCount: this.completedVideosCount,
      totalVideosCount: this.totalVideosCount,
      progressPercent: this.progressPercent,
    };
  }
}
