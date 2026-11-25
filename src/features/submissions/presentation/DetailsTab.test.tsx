import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import type * as ContentFeature from '@features/content';
import type { ContentDetail } from '@features/content';
import { DetailsTab } from './DetailsTab';
import { ReadOnlyDetails } from './ReadOnlyDetails';

vi.mock('./ThumbnailUploadField', () => ({
  ThumbnailUploadField: (props: { readonly readOnly?: boolean }) => (
    <div
      data-testid="thumbnail-upload-field"
      data-readonly={String(Boolean(props.readOnly))}
    >
      Thumbnail Upload Field Mock
    </div>
  ),
}));

vi.mock('@features/content/presentation/use-content-module', () => ({
  useContentModule: () => ({
    gateway: {},
  }),
}));

vi.mock(
  '@features/content',
  async (importOriginal: () => Promise<typeof ContentFeature>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useContentCategories: () => ({
        data: [{ id: 'cat-1', name: 'Templates', type: 2 }],
        isLoading: false,
      }),
      useUserScopeData: () => ({
        data: { branches: [], teams: [] },
        isLoading: false,
      }),
    };
  },
);

const mockContent: ContentDetail = {
  id: 'res-1',
  type: 2, // Resource
  title: 'Test Resource',
  subtitle: 'Resource Subtitle',
  description: 'Resource Description',
  categoryId: 'cat-1',
  topic: 'Documentation',
  difficulty: 0,
  language: 'English',
  durationSeconds: 0,
  visibility: 0,
  branchIds: [],
  teamIds: null,
  quizId: null,
  isQuizRequired: false,
  thumbnailAlt: 'Alternative thumbnail description',
  keywords: 'resource, template',
  slug: 'test-resource',
  status: 5,
  ownerId: 'owner-1',
  ownerName: 'Alice',
  submittedById: 'sub-1',
  submittedByName: 'Alice',
  submittedAt: '2026-10-01T00:00:00Z',
  reviewNote: null,
  thumbnailUrl: 'https://cdn/live-thumb.png',
  canModify: true,
  media: [],
  sections: [],
  tags: ['template'],
};

vi.mock('./use-draft-editor', () => ({
  useDraftEditor: () => ({
    contentTypeKey: 'resource',
    contentId: 'res-1',
    content: mockContent,
    draftState: {
      details: {
        title: 'Test Resource',
        subtitle: 'Resource Subtitle',
        description: 'Resource Description',
        categoryId: 'cat-1',
        topic: 'Documentation',
        difficulty: 0,
        language: 'English',
        durationSeconds: 0,
        visibility: 0,
        keywords: 'resource, template',
        thumbnailAlt: 'Alternative thumbnail description',
        thumbnailMediaAssetId: null,
      },
      tags: ['template'],
      media: [],
    },
    updateDetails: vi.fn(),
    updateTags: vi.fn(),
    updateMedia: vi.fn(),
  }),
}));

describe('DetailsTab - Resource Thumbnail Support', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- jsdom lacks execCommand implementation
    document.execCommand = vi.fn();
  });

  it('renders ThumbnailUploadField when editing a resource submission', () => {
    render(<DetailsTab />);

    const thumbUpload = screen.getByTestId('thumbnail-upload-field');
    expect(thumbUpload).toBeInTheDocument();
    expect(thumbUpload).toHaveAttribute('data-readonly', 'false');
  });

  it('renders read-only ThumbnailUploadField in ReadOnlyDetails for resources', () => {
    render(<ReadOnlyDetails categoryName="Templates" />);

    const thumbUpload = screen.getByTestId('thumbnail-upload-field');
    expect(thumbUpload).toBeInTheDocument();
    expect(thumbUpload).toHaveAttribute('data-readonly', 'true');
  });
});
