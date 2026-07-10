export interface ResourceProps {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly category: string;
  readonly views: number;
  readonly helpful: number;
  readonly updated: Date;
}

/** The admin-editable subset of a resource's details. */
export interface ResourceDetailsPatch {
  readonly title: string;
  readonly category: string;
  readonly type: string;
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

  public constructor(props: ResourceProps) {
    this.id = props.id;
    this.title = props.title;
    this.type = props.type;
    this.category = props.category;
    this.views = props.views;
    this.helpful = clampCount(props.helpful);
    this.updated = props.updated;
  }

  /** True once this resource has earned a meaningful number of helpful votes. */
  public isPopular(): boolean {
    return this.helpful >= 50;
  }

  /** Return a copy with an explicit helpful count (clamped to >= 0). */
  public withHelpful(next: number): Resource {
    return new Resource({ ...this.toProps(), helpful: clampCount(next) });
  }

  /** Return a copy with edited display details (title, category, type). */
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
    };
  }
}

const clampCount = (value: number): number => Math.max(0, Math.round(value));
