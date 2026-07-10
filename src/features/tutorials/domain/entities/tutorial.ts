/** The difficulty tiers a tutorial can be tagged with, ordered from easiest to hardest. */
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

/** A single tutorial difficulty tier. */
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface TutorialProps {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly duration: string;
  readonly views: number;
  readonly difficulty: Difficulty;
  /** One-line summary of what the tutorial covers. */
  readonly description: string;
  /** When the tutorial was last revised — the key freshness signal for a how-to library. */
  readonly updatedAt: Date;
  /** Uploaded content file (data URL) that replaces the demo media, or null. */
  readonly mediaUrl?: string | null;
  readonly thumbnailUrl?: string | null;
}

/** A tutorial is treated as "recently updated" within this many days of its last revision. */
export const RECENTLY_UPDATED_DAYS = 30;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** The admin-editable subset of a tutorial's details. Media fields are kept when omitted. */
export interface TutorialDetailsPatch {
  readonly title: string;
  readonly category: string;
  readonly duration: string;
  readonly difficulty: Difficulty;
  readonly description: string;
  readonly mediaUrl?: string;
  readonly thumbnailUrl?: string;
}

/**
 * A bite-sized how-to tutorial. Immutable: fields are set once at construction so the presentation
 * layer can rely on reference equality for cache updates. Business questions ("is this a good
 * starting point?") are answered by the entity — never by a component or store.
 */
export class Tutorial {
  public readonly id: string;
  public readonly title: string;
  public readonly category: string;
  public readonly duration: string;
  public readonly views: number;
  public readonly difficulty: Difficulty;
  public readonly description: string;
  public readonly updatedAt: Date;
  public readonly mediaUrl: string | null;
  public readonly thumbnailUrl: string | null;

  public constructor(props: TutorialProps) {
    this.id = props.id;
    this.title = props.title;
    this.category = props.category;
    this.duration = props.duration;
    this.views = props.views;
    this.difficulty = props.difficulty;
    this.description = props.description;
    this.updatedAt = props.updatedAt;
    this.mediaUrl = props.mediaUrl ?? null;
    this.thumbnailUrl = props.thumbnailUrl ?? null;
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

  /** Return a copy with edited details (title, category, duration, difficulty, description, media). */
  public withDetails(patch: TutorialDetailsPatch): Tutorial {
    return new Tutorial({
      id: this.id,
      title: patch.title,
      category: patch.category,
      duration: patch.duration,
      views: this.views,
      difficulty: patch.difficulty,
      description: patch.description,
      updatedAt: this.updatedAt,
      mediaUrl: patch.mediaUrl ?? this.mediaUrl,
      thumbnailUrl: patch.thumbnailUrl ?? this.thumbnailUrl,
    });
  }
}
