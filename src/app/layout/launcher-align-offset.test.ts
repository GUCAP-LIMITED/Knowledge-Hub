import { describe, expect, it } from 'vitest';
import { launcherAlignOffset } from './launcher-align-offset';

describe('launcherAlignOffset', () => {
  it('shifts the panel right by the free space beyond the edge gutter', () => {
    expect(launcherAlignOffset(1000, 1280)).toBe(-264);
  });

  it('does not shift when the trigger is already within the gutter of the edge', () => {
    expect(launcherAlignOffset(1270, 1280)).toBe(0);
    expect(launcherAlignOffset(1280, 1280)).toBe(0);
  });
});
