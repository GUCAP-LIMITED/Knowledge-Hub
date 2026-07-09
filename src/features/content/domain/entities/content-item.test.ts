import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { buildContentItem } from '@testing/builders/content-item.builder';

describe('ContentItem transitions', () => {
  it('publishes an item that is in review', () => {
    const result = buildContentItem({ status: 'review' }).publish();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.status).toBe('published');
      expect(result.value.isPublished()).toBe(true);
    }
  });

  it('publishes a draft directly', () => {
    expect(isOk(buildContentItem({ status: 'draft' }).publish())).toBe(true);
  });

  it('refuses to publish an already-published item', () => {
    expect(isErr(buildContentItem({ status: 'published' }).publish())).toBe(true);
  });

  it('submits only a draft for review', () => {
    expect(isOk(buildContentItem({ status: 'draft' }).submitForReview())).toBe(true);
    expect(isErr(buildContentItem({ status: 'review' }).submitForReview())).toBe(true);
  });

  it('unpublishes only a published item back to draft', () => {
    const result = buildContentItem({ status: 'published' }).unpublish();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.status).toBe('draft');
    }
    expect(isErr(buildContentItem({ status: 'draft' }).unpublish())).toBe(true);
  });
});
