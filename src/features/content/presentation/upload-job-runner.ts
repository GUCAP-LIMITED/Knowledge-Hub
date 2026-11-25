import { UnexpectedError } from '@core/errors';
import { err, ok, type Result } from '@core/result';
import type { ContentDetail, ContentGateway } from '../domain';
import { nextUploadJobId, useUploadQueueStore } from '../store';
import { UploadCancelledError, type UploadRunContext } from './upload-run-context';

const PARTIAL_DRAFT_NOTE =
  'Cancelled. A partial draft may remain in My Submissions — remove it from there.';

export interface UploadJobOptions<TInput> {
  readonly gateway: Pick<ContentGateway, 'remove'>;
  readonly run: (input: TInput, context: UploadRunContext) => Promise<ContentDetail>;
  readonly onSuccess: () => void;
}

interface JobControl {
  readonly cancel: () => void;
  readonly retry: () => void;
}

/** Per-job cancel/retry handles. Kept outside the Zustand store on purpose: they hold the user's
 * `File`s and closures, which aren't serialisable UI state. Entries live until the job is
 * dismissed (so a failed/cancelled job can still be retried) or finishes successfully. */
const controls = new Map<string, JobControl>();

/** The content record a job created, so a cancel/retry can remove the half-built draft. */
class CreatedDraft {
  private contentId: string | null = null;

  public get id(): string | null {
    return this.contentId;
  }

  public record(contentId: string): void {
    this.contentId = contentId;
  }

  public forget(): void {
    this.contentId = null;
  }
}

const queue = (): ReturnType<typeof useUploadQueueStore.getState> =>
  useUploadQueueStore.getState();

/** Best-effort removal of the half-built content record; false when it could not be removed. */
const removePartialDraft = async (
  gateway: Pick<ContentGateway, 'remove'>,
  contentId: string | null,
): Promise<boolean> => {
  if (contentId === null) return true;
  try {
    await gateway.remove(contentId);
    return true;
  } catch {
    return false;
  }
};

const runAttempt = async <TInput>(
  options: UploadJobOptions<TInput>,
  jobId: string,
  input: TInput,
  draft: CreatedDraft,
): Promise<Result<ContentDetail>> => {
  const controller = new AbortController();
  controls.set(jobId, {
    cancel: () => {
      queue().markCancelling(jobId);
      controller.abort();
    },
    retry: () => {
      const status = queue().jobs.find((job) => job.id === jobId)?.status;
      if (status !== 'error' && status !== 'cancelled') return;
      void restart(options, jobId, input, draft);
    },
  });

  try {
    const result = await options.run(input, {
      signal: controller.signal,
      onFileDone: () => {
        queue().reportFileDone(jobId);
      },
      onContentCreated: (contentId) => {
        draft.record(contentId);
      },
    });
    queue().completeJob(jobId);
    controls.delete(jobId);
    options.onSuccess();
    return ok(result);
  } catch (error) {
    if (controller.signal.aborted) {
      const removed = await removePartialDraft(options.gateway, draft.id);
      if (removed) draft.forget();
      queue().cancelJob(jobId, removed ? null : PARTIAL_DRAFT_NOTE);
      return err(new UploadCancelledError());
    }
    queue().failJob(jobId, error instanceof Error ? error.message : 'Upload failed.');
    return err(UnexpectedError.from(error));
  }
};

/** Retry = clean restart: drop whatever the failed/cancelled run left behind, then run again
 * from the first file, so a retry never leaves a duplicate content record. */
const restart = async <TInput>(
  options: UploadJobOptions<TInput>,
  jobId: string,
  input: TInput,
  draft: CreatedDraft,
): Promise<void> => {
  queue().restartJob(jobId);
  if (await removePartialDraft(options.gateway, draft.id)) {
    draft.forget();
  }
  await runAttempt(options, jobId, input, draft);
};

/** Registers a job in the queue store and runs it; resolves once this first attempt settles. */
export const startUploadJob = <TInput>(
  options: UploadJobOptions<TInput>,
  input: TInput,
  label: string,
  totalFiles: number,
): Promise<Result<ContentDetail>> => {
  const jobId = nextUploadJobId();
  queue().startJob(jobId, label, totalFiles);
  return runAttempt(options, jobId, input, new CreatedDraft());
};

/** Stops a running job at the next checkpoint (and aborts the in-flight transfer). */
export const cancelUploadJob = (jobId: string): void => {
  controls.get(jobId)?.cancel();
};

/** Re-runs a failed or cancelled job from scratch with its original input. */
export const retryUploadJob = (jobId: string): void => {
  controls.get(jobId)?.retry();
};

/** Removes a job from the widget and releases what a retry would have needed. */
export const dismissUploadJob = (jobId: string): void => {
  controls.delete(jobId);
  queue().dismissJob(jobId);
};

export const dismissAllUploadJobs = (): void => {
  controls.clear();
  queue().dismissAll();
};
