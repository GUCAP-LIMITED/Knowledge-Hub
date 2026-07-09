export type AnnouncementPriority = 'high' | 'medium' | 'normal' | 'low';

export interface AnnouncementProps {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly priority: AnnouncementPriority;
  readonly author: string;
  readonly date: string;
  readonly read: boolean;
}

/**
 * A broadcast announcement. Immutable — marking it read returns a new instance so the presentation
 * layer can rely on reference equality for cache updates.
 */
export class Announcement {
  public readonly id: string;
  public readonly title: string;
  public readonly content: string;
  public readonly priority: AnnouncementPriority;
  public readonly author: string;
  public readonly date: string;
  public readonly read: boolean;

  public constructor(props: AnnouncementProps) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
    this.priority = props.priority;
    this.author = props.author;
    this.date = props.date;
    this.read = props.read;
  }

  public isUnread(): boolean {
    return !this.read;
  }

  public markRead(): Announcement {
    return new Announcement({ ...this.toProps(), read: true });
  }

  private toProps(): AnnouncementProps {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      priority: this.priority,
      author: this.author,
      date: this.date,
      read: this.read,
    };
  }
}
