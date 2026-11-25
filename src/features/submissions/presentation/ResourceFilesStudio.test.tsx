import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type * as ContentFeature from '@features/content';
import { MEDIA_KIND, MEDIA_SLOT, type MediaDraftInput } from '@features/content';
import { formatFileSize } from './resource-file-types';
import { ResourceFilesStudio } from './ResourceFilesStudio';

const mockUpdateMedia = vi.fn();
let mockDraftMedia: MediaDraftInput[] = [];

vi.mock('./use-draft-editor', () => ({
  useDraftEditor: () => ({
    contentId: 'res-1',
    draftState: {
      media: mockDraftMedia,
    },
    updateMedia: mockUpdateMedia,
  }),
}));

vi.mock('@features/content/presentation/use-content-module', () => ({
  useContentModule: () => ({
    gateway: {
      requestUpload: vi.fn(),
      uploadToBlob: vi.fn(),
    },
  }),
}));

vi.mock(
  '@features/content',
  async (importOriginal: () => Promise<typeof ContentFeature>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useGetMediaReadSas: () => ({ data: null, isLoading: false }),
    };
  },
);

describe('formatFileSize', () => {
  it('returns "Unknown size" for falsy or non-positive bytes', () => {
    expect(formatFileSize(undefined)).toBe('Unknown size');
    expect(formatFileSize(null)).toBe('Unknown size');
    expect(formatFileSize(0)).toBe('Unknown size');
    expect(formatFileSize(-100)).toBe('Unknown size');
  });

  it('formats bytes under 1 KB accurately', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1)).toBe('1 B');
  });

  it('formats kilobytes accurately', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(20480)).toBe('20 KB');
  });

  it('formats megabytes accurately', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(2621440)).toBe('2.5 MB');
    expect(formatFileSize(15728640)).toBe('15 MB');
  });

  it('formats gigabytes accurately', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(2684354560)).toBe('2.5 GB');
  });
});

describe('ResourceFilesStudio - Thumbnail Isolation', () => {
  const thumbnailItem: MediaDraftInput = {
    id: 'thumb-1',
    azureBlobName: 'thumb.png',
    originalFileName: 'cover.png',
    mimeType: 'image/png',
    sizeBytes: 10240,
    kind: MEDIA_KIND.image,
    slot: MEDIA_SLOT.thumbnail,
    previewUrl: 'https://blob/cover.png',
  };

  const primaryDoc: MediaDraftInput = {
    id: 'doc-1',
    azureBlobName: 'doc1.pdf',
    originalFileName: 'guide.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1048576,
    kind: MEDIA_KIND.document,
    slot: MEDIA_SLOT.resourceFile,
    previewUrl: 'https://blob/doc1.pdf',
  };

  const attachmentDoc: MediaDraftInput = {
    id: 'doc-2',
    azureBlobName: 'doc2.xlsx',
    originalFileName: 'sheet.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 524288,
    kind: MEDIA_KIND.document,
    slot: MEDIA_SLOT.attachment,
    previewUrl: 'https://blob/doc2.xlsx',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDraftMedia = [thumbnailItem, primaryDoc, attachmentDoc];
  });

  it('only displays downloadable documents and excludes thumbnail image from Attached Documents count', () => {
    render(<ResourceFilesStudio />);

    // Count should be 2, ignoring the thumbnail
    expect(screen.getByText('Attached Documents (2)')).toBeInTheDocument();
    expect(screen.getByText('guide.pdf')).toBeInTheDocument();
    expect(screen.getByText('sheet.xlsx')).toBeInTheDocument();
    expect(screen.queryByText('cover.png')).not.toBeInTheDocument();
  });

  it('preserves thumbnail item when removing an attached document', () => {
    render(<ResourceFilesStudio />);

    // Click remove button on the second document
    const removeButtons = screen.getAllByTitle('Remove File');
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[1]!);

    expect(mockUpdateMedia).toHaveBeenCalledTimes(1);
    const updated = mockUpdateMedia.mock.calls[0]![0] as readonly MediaDraftInput[];

    // Thumbnail must remain intact
    const thumb = updated.find((m) => m.slot === MEDIA_SLOT.thumbnail);
    expect(thumb).toBeDefined();
    expect(thumb?.id).toBe('thumb-1');

    // Only guide.pdf remains, doc2 was removed
    expect(updated.find((m) => m.id === 'doc-1')).toBeDefined();
    expect(updated.find((m) => m.id === 'doc-2')).toBeUndefined();
  });

  it('preserves thumbnail item and slot when making another document primary', () => {
    render(<ResourceFilesStudio />);

    // Click "Make Primary" on the second document
    const makePrimaryBtn = screen.getByTitle('Make Primary Download');
    fireEvent.click(makePrimaryBtn);

    expect(mockUpdateMedia).toHaveBeenCalledTimes(1);
    const updated = mockUpdateMedia.mock.calls[0]![0] as readonly MediaDraftInput[];

    // Thumbnail must remain intact in slot MEDIA_SLOT.thumbnail
    const thumb = updated.find((m) => m.slot === MEDIA_SLOT.thumbnail);
    expect(thumb).toBeDefined();
    expect(thumb?.slot).toBe(MEDIA_SLOT.thumbnail);

    // doc-2 should now have slot resourceFile
    const newPrimary = updated.find((m) => m.id === 'doc-2');
    expect(newPrimary?.slot).toBe(MEDIA_SLOT.resourceFile);

    // doc-1 should now have slot attachment
    const demoted = updated.find((m) => m.id === 'doc-1');
    expect(demoted?.slot).toBe(MEDIA_SLOT.attachment);
  });
});
