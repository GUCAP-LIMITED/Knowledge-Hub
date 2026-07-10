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

  public constructor(props: TutorialProps) {
    this.id = props.id;
    this.title = props.title;
    this.category = props.category;
    this.duration = props.duration;
    this.views = props.views;
    this.difficulty = props.difficulty;
  }

  /** True when the tutorial is aimed at newcomers (no prior knowledge assumed). */
  public isBeginnerFriendly(): boolean {
    return this.difficulty === 'Beginner';
  }

  /** Return a copy with edited display details (title + category). */
  public withDetails(title: string, category: string): Tutorial {
    return new Tutorial({
      id: this.id,
      title,
      category,
      duration: this.duration,
      views: this.views,
      difficulty: this.difficulty,
    });
  }
}
