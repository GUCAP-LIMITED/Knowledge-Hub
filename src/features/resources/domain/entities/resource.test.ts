import { describe, expect, it } from 'vitest';
import { buildResource } from '@testing/builders/resource.builder';

describe('Resource', () => {
  it('reports popularity once helpful reaches the threshold', () => {
    expect(buildResource({ helpful: 50 }).isPopular()).toBe(true);
    expect(buildResource({ helpful: 49 }).isPopular()).toBe(false);
  });

  it('clamps helpful to a non-negative integer and returns a new instance', () => {
    const resource = buildResource({ helpful: 10 });
    const updated = resource.withHelpful(-5);
    expect(updated).not.toBe(resource);
    expect(updated.helpful).toBe(0);
    expect(resource.helpful).toBe(10);
  });

  it('tracks canModify and defaults to false when omitted', () => {
    expect(buildResource().canModify).toBe(false);
    expect(buildResource({ canModify: true }).canModify).toBe(true);
  });

  it('preserves canModify across withHelpful, withHelpfulVote, and withDetails', () => {
    const resource = buildResource({ canModify: true });
    expect(resource.withHelpful(20).canModify).toBe(true);
    expect(resource.withHelpfulVote(30, true).canModify).toBe(true);
    expect(
      resource.withDetails({
        title: 'New Title',
        category: 'New Category',
        type: 'Doc',
        description: 'New Desc',
      }).canModify,
    ).toBe(true);
  });
});
