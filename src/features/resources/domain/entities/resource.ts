export interface ResourceProps {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly category: string;
  readonly views: number;
  readonly helpful: number;
  readonly updated: Date;
  readonly description?: string;
  /** Uploaded content file (data URL) that replaces the demo media, or null. */
  readonly mediaUrl?: string | null;
  readonly thumbnailUrl?: string | null;
}

/** The admin-editable subset of a resource's details. Media fields are kept when omitted. */
export interface ResourceDetailsPatch {
  readonly title: string;
  readonly category: string;
  readonly type: string;
  readonly description: string;
  readonly mediaUrl?: string;
  readonly thumbnailUrl?: string;
}

/**
 * A knowledge-base resource. Immutable: a "helpful" change returns a new `Resource` so the
 * presentation layer can rely on reference equality for cache updates. Business questions
 * ("is this popular?") are answered by the entity — never by a component or store.
 */
export class Resource {
  public readonly id: string;
  public readonly title: string;
  public readonly type: string;
  public readonly category: string;
  public readonly views: number;
  public readonly helpful: number;
  public readonly updated: Date;
  public readonly description: string;
  public readonly mediaUrl: string | null;
  public readonly thumbnailUrl: string | null;

  public constructor(props: ResourceProps) {
    this.id = props.id;
    this.title = props.title;
    this.type = props.type;
    this.category = props.category;
    this.views = props.views;
    this.helpful = clampCount(props.helpful);
    this.updated = props.updated;
    this.description = props.description ?? '';
    this.mediaUrl = props.mediaUrl ?? null;
    this.thumbnailUrl = props.thumbnailUrl ?? null;
  }

  /** True once this resource has earned a meaningful number of helpful votes. */
  public isPopular(): boolean {
    return this.helpful >= 50;
  }

  /** Return a copy with an explicit helpful count (clamped to >= 0). */
  public withHelpful(next: number): Resource {
    return new Resource({ ...this.toProps(), helpful: clampCount(next) });
  }

  /** Return a copy with edited details (title, category, type, description, media). */
  public withDetails(patch: ResourceDetailsPatch): Resource {
    return new Resource({ ...this.toProps(), ...patch });
  }

  private toProps(): ResourceProps {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      category: this.category,
      views: this.views,
      helpful: this.helpful,
      updated: this.updated,
      description: this.description,
      mediaUrl: this.mediaUrl,
      thumbnailUrl: this.thumbnailUrl,
    };
  }
}

const clampCount = (value: number): number => Math.max(0, Math.round(value));
