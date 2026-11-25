import { create } from 'zustand';

/** `cancelling` is the beat between the user pressing cancel and the pipeline actually stopping
 * (aborting in-flight requests, removing the half-built draft). */
export type UploadJobStatus = 'uploading' | 'cancelling' | 'done' | 'error' | 'cancelled';

export interface UploadJob {
  readonly id: string;
  readonly label: string;
  readonly totalFiles: number;
  readonly completedFiles: number;
  readonly status: UploadJobStatus;
  readonly errorMessage: string | null;
}

export interface UploadQueueState {
  readonly jobs: readonly UploadJob[];
  readonly startJob: (id: string, label: string, totalFiles: number) => void;
  readonly reportFileDone: (id: string) => void;
  readonly completeJob: (id: string) => void;
  readonly failJob: (id: string, message: string) => void;
  readonly markCancelling: (id: string) => void;
  /** `message` carries a follow-up note (e.g. a partial draft that could not be removed). */
  readonly cancelJob: (id: string, message: string | null) => void;
  /** Resets a failed/cancelled job to a fresh `uploading` run (progress back to zero). */
  readonly restartJob: (id: string) => void;
  readonly dismissJob: (id: string) => void;
  /** Hides the widget entirely. Uploads already running are unaffected — they finish in the
      background regardless — this only clears what's shown; a new upload re-populates the list. */
  readonly dismissAll: () => void;
}

/**
 * Tracks in-flight content-upload jobs so the floating `UploadProgressWidget` (mounted once in
 * `AppLayout`) can show progress no matter which route the user navigates to mid-upload. The actual
 * network calls (in `use-content.ts`) keep running regardless of this store — it only surfaces
 * their progress; see `useUploadContent`, which is the sole writer.
 */
export const useUploadQueueStore = create<UploadQueueState>((set) => ({
  jobs: [],
  startJob: (id, label, totalFiles): void => {
    set((state) => ({
      jobs: [
        ...state.jobs,
        {
          id,
          label,
          totalFiles,
          completedFiles: 0,
          status: 'uploading',
          errorMessage: null,
        },
      ],
    }));
  },
  reportFileDone: (id): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, completedFiles: job.completedFiles + 1 } : job,
      ),
    }));
  },
  completeJob: (id): void => {
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === id ? { ...job, status: 'done' } : job)),
    }));
  },
  failJob: (id, message): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, status: 'error', errorMessage: message } : job,
      ),
    }));
  },
  markCancelling: (id): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, status: 'cancelling' } : job,
      ),
    }));
  },
  cancelJob: (id, message): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, status: 'cancelled', errorMessage: message } : job,
      ),
    }));
  },
  restartJob: (id): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? { ...job, status: 'uploading', completedFiles: 0, errorMessage: null }
          : job,
      ),
    }));
  },
  dismissJob: (id): void => {
    set((state) => ({ jobs: state.jobs.filter((job) => job.id !== id) }));
  },
  dismissAll: (): void => {
    set({ jobs: [] });
  },
}));

let sequence = 0;

/** Monotonic client-side id for new upload jobs (deterministic, no clock/random). */
export const nextUploadJobId = (): string => {
  sequence += 1;
  return `upload-job-${String(sequence)}`;
};
