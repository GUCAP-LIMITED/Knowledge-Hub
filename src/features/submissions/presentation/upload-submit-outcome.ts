import { UploadCancelledError } from '@features/content';

export interface SubmitOutcome {
  /** Message for a real failure — absent while all is well, and after a deliberate cancel. */
  readonly submitError: string | undefined;
  /** The user cancelled the upload themselves: not a failure, so it gets its own calm notice. */
  readonly wasCancelled: boolean;
}

/** Splits the upload mutation's error into "something went wrong" vs "the user cancelled". */
export const submitOutcome = (error: Error | null): SubmitOutcome =>
  error instanceof UploadCancelledError
    ? { submitError: undefined, wasCancelled: true }
    : { submitError: error?.message, wasCancelled: false };
