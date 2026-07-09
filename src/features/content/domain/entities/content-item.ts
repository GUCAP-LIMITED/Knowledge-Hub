import { type Result, ok, err } from '@core/result';
import {
  type ContentError,
  InvalidContentTransitionError,
} from '../errors/content-errors';

/** The kinds of content the library holds. */
export type ContentType = 'Course' | 'Tutorial' | 'Article' | 'Document' | 'Resource';

/** The publishing lifecycle a content item moves through. */
export type ContentStatus = 'draft' | 'review' | 'published';

export interface ContentItemProps {
  readonly id: string;
  readonly title: string;
  readonly type: ContentType;
  readonly status: ContentStatus;
  readonly author: string;
  readonly createdAt: Date;
  readonly views: number;
}

/**
 * A piece of library content. Immutable: every transition validates the current status and returns
 * a `Result`, so no store or component can push it into an illegal state ("tell, don't ask"). A
 * transition returns a new instance so presentation can rely on reference equality for cache updates.
 *
 * Allowed transitions:
 *   draft ──submitForReview──▶ review
 *   review | draft ──publish──▶ published
 *   published ──unpublish──▶ draft
 */
export class ContentItem {
  public readonly id: string;
  public readonly title: string;
  public readonly type: ContentType;
  public readonly status: ContentStatus;
  public readonly author: string;
  public readonly createdAt: Date;
  public readonly views: number;

  public constructor(props: ContentItemProps) {
    this.id = props.id;
    this.title = props.title;
    this.type = props.type;
    this.status = props.status;
    this.author = props.author;
    this.createdAt = props.createdAt;
    this.views = props.views;
  }

  /** True once the item is live and visible to learners. */
  public isPublished(): boolean {
    return this.status === 'published';
  }

  /** Move a draft into the review queue. */
  public submitForReview(): Result<ContentItem, ContentError> {
    if (this.status !== 'draft') {
      return err(new InvalidContentTransitionError(this.status, 'submit for review'));
    }
    return ok(this.copyWith({ status: 'review' }));
  }

  /** Publish an item that is in review or draft. */
  public publish(): Result<ContentItem, ContentError> {
    if (this.status !== 'review' && this.status !== 'draft') {
      return err(new InvalidContentTransitionError(this.status, 'publish'));
    }
    return ok(this.copyWith({ status: 'published' }));
  }

  /** Take a published item back to draft. */
  public unpublish(): Result<ContentItem, ContentError> {
    if (this.status !== 'published') {
      return err(new InvalidContentTransitionError(this.status, 'unpublish'));
    }
    return ok(this.copyWith({ status: 'draft' }));
  }

  private copyWith(patch: Partial<ContentItemProps>): ContentItem {
    return new ContentItem({ ...this.toProps(), ...patch });
  }

  private toProps(): ContentItemProps {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      status: this.status,
      author: this.author,
      createdAt: this.createdAt,
      views: this.views,
    };
  }
}
