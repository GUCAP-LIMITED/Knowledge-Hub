import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentDetail } from '../domain';
import { useUploadQueueStore } from '../store';
import {
  cancelUploadJob,
  dismissUploadJob,
  retryUploadJob,
  startUploadJob,
  type UploadJobOptions,
} from './upload-job-runner';
import { UploadCancelledError, type UploadRunContext } from './upload-run-context';

const DETAIL = { id: 'content-1' } as unknown as ContentDetail;

const firstJob = (): NonNullable<
  ReturnType<typeof useUploadQueueStore.getState>['jobs'][number]
> => {
  const job = useUploadQueueStore.getState().jobs[0];
  if (job === undefined) throw new Error('No upload job registered');
  return job;
};

const options = (
  run: UploadJobOptions<string>['run'],
  remove = vi.fn(() => Promise.resolve()),
): UploadJobOptions<string> & { readonly remove: typeof remove } => ({
  gateway: { remove },
  run,
  onSuccess: vi.fn(),
  remove,
});

/** A run that creates its draft, then waits until cancelled. */
const hangUntilCancelled = (context: UploadRunContext): Promise<ContentDetail> =>
  new Promise((_resolve, reject) => {
    context.onContentCreated('content-1');
    context.signal.addEventListener('abort', () => {
      reject(new UploadCancelledError());
    });
  });

describe('upload job runner', () => {
  beforeEach(() => {
    useUploadQueueStore.setState({ jobs: [] });
  });

  it('runs a job to completion and reports progress', async () => {
    const opts = options((_input, context) => {
      context.onFileDone();
      return Promise.resolve(DETAIL);
    });

    const result = await startUploadJob(opts, 'input', 'My course', 1);

    expect(result.ok).toBe(true);
    expect(firstJob()).toMatchObject({ status: 'done', completedFiles: 1 });
    expect(opts.onSuccess).toHaveBeenCalledTimes(1);
  });

  it('cancels a running job, aborts it and removes the half-built draft', async () => {
    const opts = options((_input, context) => hangUntilCancelled(context));
    const pending = startUploadJob(opts, 'input', 'My course', 2);

    cancelUploadJob(firstJob().id);
    expect(firstJob().status).toBe('cancelling');

    const result = await pending;

    expect(result.ok).toBe(false);
    expect(opts.remove).toHaveBeenCalledWith('content-1');
    expect(firstJob()).toMatchObject({ status: 'cancelled', errorMessage: null });
  });

  it('says so when the partial draft could not be removed after a cancel', async () => {
    const opts = options(
      (_input, context) => hangUntilCancelled(context),
      vi.fn(() => Promise.reject(new Error('nope'))),
    );
    const pending = startUploadJob(opts, 'input', 'My course', 2);

    cancelUploadJob(firstJob().id);
    await pending;

    expect(firstJob().status).toBe('cancelled');
    expect(firstJob().errorMessage).toMatch(/partial draft/i);
  });

  it('retries a failed job from scratch, removing the partial draft first', async () => {
    let attempt = 0;
    const opts = options((_input, context) => {
      attempt += 1;
      context.onContentCreated(`content-${String(attempt)}`);
      return attempt === 1
        ? Promise.reject(new Error('network down'))
        : Promise.resolve(DETAIL);
    });

    await startUploadJob(opts, 'input', 'My course', 1);
    expect(firstJob()).toMatchObject({ status: 'error', errorMessage: 'network down' });

    retryUploadJob(firstJob().id);

    await vi.waitFor(() => {
      expect(firstJob().status).toBe('done');
    });
    expect(opts.remove).toHaveBeenCalledWith('content-1');
    expect(attempt).toBe(2);
    expect(opts.onSuccess).toHaveBeenCalledTimes(1);
  });

  it('can retry a cancelled job too', async () => {
    let attempt = 0;
    const opts = options((_input, context) => {
      attempt += 1;
      return attempt === 1 ? hangUntilCancelled(context) : Promise.resolve(DETAIL);
    });
    const pending = startUploadJob(opts, 'input', 'My course', 1);
    cancelUploadJob(firstJob().id);
    await pending;

    retryUploadJob(firstJob().id);

    await vi.waitFor(() => {
      expect(firstJob().status).toBe('done');
    });
  });

  it('does not retry a job that is still running', async () => {
    const run = vi.fn((_input: string, context: UploadRunContext) =>
      hangUntilCancelled(context),
    );
    const opts = options(run);
    const pending = startUploadJob(opts, 'input', 'My course', 1);

    retryUploadJob(firstJob().id);
    expect(run).toHaveBeenCalledTimes(1);

    cancelUploadJob(firstJob().id);
    await pending;
  });

  it('cannot retry once the job was dismissed', async () => {
    const run = vi.fn(() => Promise.reject(new Error('boom')));
    const opts = options(run);
    await startUploadJob(opts, 'input', 'My course', 1);
    const { id } = firstJob();

    dismissUploadJob(id);
    retryUploadJob(id);

    expect(run).toHaveBeenCalledTimes(1);
    expect(useUploadQueueStore.getState().jobs).toEqual([]);
  });
});
