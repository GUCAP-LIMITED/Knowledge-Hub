import { describe, expect, it } from 'vitest';
import { runWithConcurrencyLimit } from './run-with-concurrency-limit';

describe('runWithConcurrencyLimit', () => {
  it('processes every item', async () => {
    const seen: number[] = [];
    await runWithConcurrencyLimit([1, 2, 3, 4, 5], 2, async (item) => {
      await Promise.resolve();
      seen.push(item);
    });
    expect(seen.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('never runs more than `limit` workers at once', async () => {
    let active = 0;
    let maxActive = 0;
    const items = Array.from({ length: 10 }, (_unused, i) => i);

    await runWithConcurrencyLimit(items, 3, async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active -= 1;
    });

    expect(maxActive).toBeLessThanOrEqual(3);
  });

  it('handles an empty list', async () => {
    const seen: number[] = [];
    await runWithConcurrencyLimit([], 3, async (item: number) => {
      await Promise.resolve();
      seen.push(item);
    });
    expect(seen).toEqual([]);
  });

  it('propagates a worker error', async () => {
    await expect(
      runWithConcurrencyLimit([1, 2, 3], 2, async (item) => {
        await Promise.resolve();
        if (item === 2) throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
  });
});
