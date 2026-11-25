import { beforeEach, describe, expect, it } from 'vitest';
import { nextUploadJobId, useUploadQueueStore } from './upload-queue-store';

const resetStore = (): void => {
  useUploadQueueStore.setState({ jobs: [] });
};

describe('useUploadQueueStore', () => {
  beforeEach(resetStore);

  it('starts a job with zero completed files', () => {
    useUploadQueueStore.getState().startJob('job-1', 'My Course', 3);
    expect(useUploadQueueStore.getState().jobs).toEqual([
      {
        id: 'job-1',
        label: 'My Course',
        totalFiles: 3,
        completedFiles: 0,
        status: 'uploading',
        errorMessage: null,
      },
    ]);
  });

  it('increments completed files without touching other jobs', () => {
    const { startJob, reportFileDone } = useUploadQueueStore.getState();
    startJob('job-1', 'A', 2);
    startJob('job-2', 'B', 2);
    reportFileDone('job-1');
    const jobs = useUploadQueueStore.getState().jobs;
    expect(jobs.find((j) => j.id === 'job-1')?.completedFiles).toBe(1);
    expect(jobs.find((j) => j.id === 'job-2')?.completedFiles).toBe(0);
  });

  it('marks a job done', () => {
    const { startJob, completeJob } = useUploadQueueStore.getState();
    startJob('job-1', 'A', 1);
    completeJob('job-1');
    expect(useUploadQueueStore.getState().jobs[0]?.status).toBe('done');
  });

  it('marks a job failed with a message', () => {
    const { startJob, failJob } = useUploadQueueStore.getState();
    startJob('job-1', 'A', 1);
    failJob('job-1', 'network error');
    const job = useUploadQueueStore.getState().jobs[0];
    expect(job?.status).toBe('error');
    expect(job?.errorMessage).toBe('network error');
  });

  it('dismisses a job', () => {
    const { startJob, dismissJob } = useUploadQueueStore.getState();
    startJob('job-1', 'A', 1);
    dismissJob('job-1');
    expect(useUploadQueueStore.getState().jobs).toEqual([]);
  });

  it('dismisses every job, including ones still uploading', () => {
    const { startJob, dismissAll } = useUploadQueueStore.getState();
    startJob('job-1', 'A', 1);
    startJob('job-2', 'B', 1);
    dismissAll();
    expect(useUploadQueueStore.getState().jobs).toEqual([]);
  });

  it('moves a job through cancelling to cancelled, optionally with a note', () => {
    const { startJob, markCancelling, cancelJob } = useUploadQueueStore.getState();
    startJob('job-1', 'A', 2);

    markCancelling('job-1');
    expect(useUploadQueueStore.getState().jobs[0]?.status).toBe('cancelling');

    cancelJob('job-1', 'partial draft remains');
    const job = useUploadQueueStore.getState().jobs[0];
    expect(job?.status).toBe('cancelled');
    expect(job?.errorMessage).toBe('partial draft remains');
  });

  it('restarts a failed job from zero with its error cleared', () => {
    const { startJob, reportFileDone, failJob, restartJob } =
      useUploadQueueStore.getState();
    startJob('job-1', 'A', 3);
    reportFileDone('job-1');
    failJob('job-1', 'network error');

    restartJob('job-1');

    expect(useUploadQueueStore.getState().jobs[0]).toMatchObject({
      status: 'uploading',
      completedFiles: 0,
      errorMessage: null,
      totalFiles: 3,
    });
  });
});

describe('nextUploadJobId', () => {
  it('returns unique, monotonic ids', () => {
    const a = nextUploadJobId();
    const b = nextUploadJobId();
    expect(a).not.toBe(b);
  });
});
