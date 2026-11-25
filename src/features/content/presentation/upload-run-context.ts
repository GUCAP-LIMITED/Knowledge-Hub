import { AppError } from '@core/errors';

/** The user cancelled an upload job; the pipeline stopped at the next checkpoint. */
export class UploadCancelledError extends AppError {
  public readonly code = 'UPLOAD_CANCELLED';

  public constructor() {
    super('Upload cancelled.');
  }
}

/** What a running upload job hands to the pipeline: how to learn it was cancelled, report
 * progress, and tell the runner which content record it created (so a cancel/retry can remove
 * the half-built draft). */
export interface UploadRunContext {
  readonly signal: AbortSignal;
  readonly onFileDone: () => void;
  readonly onContentCreated: (contentId: string) => void;
}

/** Cooperative cancellation checkpoint — call between network steps. */
export const throwIfCancelled = (signal: AbortSignal): void => {
  if (signal.aborted) {
    throw new UploadCancelledError();
  }
};
