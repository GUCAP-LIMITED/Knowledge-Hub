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
});
