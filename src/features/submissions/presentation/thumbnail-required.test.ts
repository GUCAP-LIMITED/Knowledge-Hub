import { describe, expect, it } from 'vitest';
import type { ContentDraftStateInput } from '@features/content';
import { validateDraftForSubmit } from './draft-editor-validation';
import { requiredSlotsFilled, slotsFor } from './upload-content-types';

const DETAILS: ContentDraftStateInput['details'] = {
  title: 'Title',
  subtitle: null,
  description: 'A description',
  categoryId: 'category-1',
  topic: null,
  difficulty: 0,
  language: null,
  durationSeconds: 0,
  visibility: 0,
  teamIds: null,
  keywords: null,
  thumbnailMediaAssetId: null,
  thumbnailAlt: null,
  tags: [],
};

const file = (name: string): File => new File(['x'], name);

describe('thumbnail is required for tutorials and resources', () => {
  it('flags the resource thumbnail slot as required in the upload wizard', () => {
    const thumbnail = slotsFor('resource').find((slot) => slot.id === 'thumbnail');
    expect(thumbnail?.required).toBe(true);
  });

  it('does not treat a resource as ready until both thumbnail and files are attached', () => {
    expect(requiredSlotsFilled('resource', { files: [file('a.pdf')] })).toBe(false);
    expect(requiredSlotsFilled('resource', { thumbnail: [file('t.png')] })).toBe(false);
    expect(
      requiredSlotsFilled('resource', {
        thumbnail: [file('t.png')],
        files: [file('a.pdf')],
      }),
    ).toBe(true);
  });

  it('keeps the tutorial thumbnail required in the upload wizard', () => {
    expect(requiredSlotsFilled('tutorial', { primary: [file('v.mp4')] })).toBe(false);
  });

  it.each(['tutorial', 'resource'] as const)(
    'blocks submitting a %s draft that has no thumbnail',
    (kind) => {
      const error = validateDraftForSubmit({ details: DETAILS, tags: [] }, kind);
      expect(error).toMatch(/thumbnail is required/i);
    },
  );

  it('allows a resource draft once its thumbnail asset is set', () => {
    const error = validateDraftForSubmit(
      { details: { ...DETAILS, thumbnailMediaAssetId: 'asset-1' }, tags: [] },
      'resource',
    );
    expect(error).toBeNull();
  });
});
