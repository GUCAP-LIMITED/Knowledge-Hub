import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { UploadSlot } from './upload-content-types';
import { SlotCard } from './UploadSlotCard';
import { SubmitAttemptContext } from './submit-attempt-context';

const requiredSlot: UploadSlot = {
  id: 'thumbnail',
  label: 'Course thumbnail',
  hint: '16:9 recommended',
  accept: 'image',
  single: true,
  required: true,
};

const renderSlot = (attempt: number, files: readonly File[] = []): void => {
  render(
    <SubmitAttemptContext.Provider value={attempt}>
      <SlotCard slot={requiredSlot} files={files} onChange={() => undefined} />
    </SubmitAttemptContext.Provider>,
  );
};

describe('required slot feedback', () => {
  it('stays quiet until the user has tried to continue', () => {
    renderSlot(0);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('explains what is required after a blocked attempt', () => {
    renderSlot(1);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Course thumbnail is required. Upload a file to continue.',
    );
  });

  it('shows no message once a file is attached', () => {
    renderSlot(2, [new File(['x'], 'thumb.png', { type: 'image/png' })]);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
