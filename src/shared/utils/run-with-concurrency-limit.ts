/**
 * Runs `worker` over every item with at most `limit` in flight at once — a fixed pool of workers
 * pulls from a shared queue until it's empty. Bounds parallelism so a large batch (e.g. 100 file
 * uploads) can't exhaust browser connections/memory or flood the backend all at once.
 */
export const runWithConcurrencyLimit = async <T>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> => {
  const queue = [...items];

  const runWorker = async (): Promise<void> => {
    let next = queue.shift();
    while (next !== undefined) {
      await worker(next);
      next = queue.shift();
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
};
