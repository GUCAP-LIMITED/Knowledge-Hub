import { describe, expect, it } from 'vitest';
import { buildTutorial } from '@testing';

describe('Tutorial', () => {
  it('reports beginner-friendly for the Beginner tier', () => {
    expect(buildTutorial({ difficulty: 'Beginner' }).isBeginnerFriendly()).toBe(true);
  });

  it('reports not beginner-friendly for harder tiers', () => {
    expect(buildTutorial({ difficulty: 'Intermediate' }).isBeginnerFriendly()).toBe(
      false,
    );
    expect(buildTutorial({ difficulty: 'Advanced' }).isBeginnerFriendly()).toBe(false);
  });
});
