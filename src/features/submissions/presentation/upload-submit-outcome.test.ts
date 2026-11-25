import { describe, expect, it } from 'vitest';
import { UploadCancelledError } from '@features/content';
import { submitOutcome } from './upload-submit-outcome';

describe('submitOutcome', () => {
  it('reports nothing while there is no error', () => {
    expect(submitOutcome(null)).toEqual({ submitError: undefined, wasCancelled: false });
  });

  it('surfaces a real failure as an error message', () => {
    expect(submitOutcome(new Error('Upload failed (500).'))).toEqual({
      submitError: 'Upload failed (500).',
      wasCancelled: false,
    });
  });

  it('treats a user cancel as a cancel, not an error', () => {
    expect(submitOutcome(new UploadCancelledError())).toEqual({
      submitError: undefined,
      wasCancelled: true,
    });
  });
});
