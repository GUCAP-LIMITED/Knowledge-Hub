import { describe, it, expect } from 'vitest';
import {
  CONTENT_STATUS,
  type ContentDetail,
  type ContentRevision,
} from '@features/content';
import {
  createInitialDraftState,
  createLiveCurriculum,
  normalizeDisplayOrders,
  resolveRevisionStatus,
} from './draft-editor-hydrator';
import { sanitizeCurriculum, sanitizeQuiz } from './draft-editor-sanitizer';

const mockContent: ContentDetail = {
  id: 'c1111111-1111-1111-1111-111111111111',
  type: 0,
  title: 'Test Course',
  slug: 'test-course',
  branchIds: ['b1'],
  teamIds: null,
  status: 0,
  difficulty: 0,
  visibility: 0,
  thumbnailUrl: 'https://example.com/thumb.jpg',
  durationSeconds: 3600,
  subtitle: 'A great course',
  description: 'Detailed description',
  categoryId: 'cat-1',
  topic: 'Engineering',
  language: 'en',
  keywords: 'react, typescript',
  thumbnailAlt: 'Course thumbnail',
  tags: ['react', 'typescript'],
  media: [
    {
      id: 'm1',
      slot: 0,
      kind: 0,
      originalFileName: 'thumb.png',
      streamStatus: 0,
      url: 'https://example.com/m1.png',
      sizeBytes: 2048,
      mimeType: 'image/png',
    },
  ],
  sections: [
    {
      id: 's1111111-1111-1111-1111-111111111111',
      title: 'Section 1',
      displayOrder: 0,
      lessons: [
        {
          id: 'l1111111-1111-1111-1111-111111111111',
          title: 'Lesson 1',
          kind: 0,
          displayOrder: 0,
          mediaAssetId: 'm1',
          externalUrl: null,
          quizId: null,
          durationSeconds: 300,
          isPreview: true,
        },
      ],
    },
  ],
};

describe('draft-editor-sanitizer', () => {
  it('returns undefined if curriculum is undefined', () => {
    expect(sanitizeCurriculum(undefined)).toBeUndefined();
  });

  it('generates valid guids for missing or invalid IDs in sections and lessons', () => {
    const sanitized = sanitizeCurriculum({
      sections: [
        {
          id: 'invalid-id',
          title: 'Sec 1',
          lessons: [
            {
              id: 'not-a-guid',
              title: 'Les 1',
              kind: 0,
              mediaAssetId: null,
              externalUrl: null,
              durationSeconds: 100,
              isPreview: false,
            },
          ],
        },
      ],
    });

    expect(sanitized).toBeDefined();
    const sections = sanitized?.sections ?? [];
    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).not.toBe('invalid-id');
    expect(sections[0]?.lessons[0]?.id).not.toBe('not-a-guid');
  });

  it('preserves upgradeQuiz and version in sanitizeQuiz', () => {
    const sanitized = sanitizeQuiz({
      id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Quiz 1',
      passingPercentage: 75,
      isMultipleAttemptAllowed: false,
      upgradeQuiz: false,
      version: 2,
      questions: [
        {
          id: 'b0000000-0000-0000-0000-000000000002',
          prompt: 'What is 2+2?',
          options: [
            { id: 'c0000000-0000-0000-0000-000000000003', text: '4', isCorrect: true },
            { id: 'c0000000-0000-0000-0000-000000000004', text: '5', isCorrect: false },
          ],
        },
      ],
    });

    expect(sanitized).toBeDefined();
    expect(sanitized?.upgradeQuiz).toBe(false);
    expect(sanitized?.version).toBe(2);
    expect(sanitized?.passingPercentage).toBe(75);
    expect(sanitized?.isMultipleAttemptAllowed).toBe(false);
  });

  it('defaults upgradeQuiz to true in sanitizeQuiz when omitted', () => {
    const sanitized = sanitizeQuiz({
      title: 'New Quiz',
      questions: [],
    });

    expect(sanitized).toBeDefined();
    expect(sanitized?.upgradeQuiz).toBe(true);
    expect(sanitized?.version).toBeUndefined();
  });

  it('preserves upgradeQuiz: false on lesson quizzes in sanitizeCurriculum', () => {
    const sanitized = sanitizeCurriculum({
      sections: [
        {
          id: 'a0000000-0000-0000-0000-000000000001',
          title: 'Section 1',
          lessons: [
            {
              id: 'b0000000-0000-0000-0000-000000000002',
              title: 'Lesson Quiz',
              kind: 2,
              durationSeconds: 0,
              isPreview: false,
              mediaAssetId: null,
              externalUrl: null,
              quizId: 'c0000000-0000-0000-0000-000000000003',
              quiz: {
                id: 'c0000000-0000-0000-0000-000000000003',
                title: 'Lesson Quiz',
                passingPercentage: 80,
                isMultipleAttemptAllowed: true,
                upgradeQuiz: false,
                version: 1,
                questions: [],
              },
            },
          ],
        },
      ],
    });

    const lessonQuiz = sanitized?.sections[0]?.lessons[0]?.quiz;
    expect(lessonQuiz).toBeDefined();
    expect(lessonQuiz?.upgradeQuiz).toBe(false);
    expect(lessonQuiz?.version).toBe(1);
  });
});

describe('draft-editor-hydrator', () => {
  it('creates initial draft state from live content when no active revision exists', () => {
    const draft = createInitialDraftState(mockContent, null, 'course');
    expect(draft.details.title).toBe('Test Course');
    expect(draft.details.subtitle).toBe('A great course');
    expect(draft.details.branchIds).toEqual(['b1']);
    expect(draft.details.keywords).toBe('react, typescript');
    expect(draft.details.thumbnailAlt).toBe('Course thumbnail');
    expect(draft.curriculum?.sections).toHaveLength(1);
    expect(draft.media).toHaveLength(1);
    expect(draft.media?.[0]?.sizeBytes).toBe(2048);
    expect(draft.media?.[0]?.mimeType).toBe('image/png');
  });

  it('restores sizeBytes from liveMedia when revision payload has missing or zero sizeBytes', () => {
    const revisionWithZeroSize: ContentRevision = {
      id: 'rev-zero-size',
      contentItemId: mockContent.id,
      authorId: 'auth-1',
      status: CONTENT_STATUS.draft,
      payloadJson: JSON.stringify({
        media: [
          {
            id: 'm1',
            azureBlobName: '',
            originalFileName: 'thumb.png',
            mimeType: null,
            sizeBytes: 0,
            kind: 0,
            slot: 0,
            previewUrl: 'https://example.com/m1.png',
          },
        ],
      }),
      reviewerNotes: null,
      creationTime: '2026-01-01T00:00:00Z',
      lastModificationTime: null,
    };

    const draft = createInitialDraftState(mockContent, revisionWithZeroSize, 'course');
    expect(draft.media).toHaveLength(1);
    expect(draft.media?.[0]?.sizeBytes).toBe(2048);
    expect(draft.media?.[0]?.mimeType).toBe('image/png');
  });

  it('parses and hydrates draft state from active revision payload JSON', () => {
    const revision: ContentRevision = {
      id: 'rev-1',
      contentItemId: mockContent.id,
      authorId: 'auth-1',
      status: CONTENT_STATUS.draft,
      payloadJson: JSON.stringify({
        details: {
          title: 'Updated Revision Title',
        },
        tags: ['updated-tag'],
      }),
      reviewerNotes: null,
      creationTime: '2026-01-01T00:00:00Z',
      lastModificationTime: null,
    };

    const draft = createInitialDraftState(mockContent, revision, 'course');
    expect(draft.details.title).toBe('Updated Revision Title');
    expect(draft.details.subtitle).toBe('A great course');
    expect(draft.details.branchIds).toEqual(['b1']);
    expect(draft.tags).toEqual(['updated-tag']);
    expect(draft.details.keywords).toBe('react, typescript');
    expect(draft.details.thumbnailAlt).toBe('Course thumbnail');
  });

  it('hydrates updated branchIds from revision payload', () => {
    const revision: ContentRevision = {
      id: 'rev-branch',
      contentItemId: mockContent.id,
      authorId: 'auth-1',
      status: CONTENT_STATUS.draft,
      payloadJson: JSON.stringify({
        details: {
          branchIds: ['b2', 'b3'],
        },
      }),
      reviewerNotes: null,
      creationTime: '2026-01-01T00:00:00Z',
      lastModificationTime: null,
    };

    const draft = createInitialDraftState(mockContent, revision, 'course');
    expect(draft.details.branchIds).toEqual(['b2', 'b3']);
  });

  it('preserves non-zero durationSeconds from revision payload or live content', () => {
    const revisionWithDuration: ContentRevision = {
      id: 'rev-dur',
      contentItemId: mockContent.id,
      authorId: 'auth-1',
      status: CONTENT_STATUS.draft,
      payloadJson: JSON.stringify({
        details: {
          durationSeconds: 23,
        },
      }),
      reviewerNotes: null,
      creationTime: '2026-01-01T00:00:00Z',
      lastModificationTime: null,
    };

    const draftWithRevisionDuration = createInitialDraftState(
      mockContent,
      revisionWithDuration,
      'course',
    );
    expect(draftWithRevisionDuration.details.durationSeconds).toBe(23);

    const revisionWithoutDuration: ContentRevision = {
      id: 'rev-zero-dur',
      contentItemId: mockContent.id,
      authorId: 'auth-1',
      status: CONTENT_STATUS.draft,
      payloadJson: JSON.stringify({
        details: {
          durationSeconds: 0,
        },
      }),
      reviewerNotes: null,
      creationTime: '2026-01-01T00:00:00Z',
      lastModificationTime: null,
    };

    const draftWithLiveFallback = createInitialDraftState(
      { ...mockContent, durationSeconds: 45 },
      revisionWithoutDuration,
      'course',
    );
    expect(draftWithLiveFallback.details.durationSeconds).toBe(45);
  });

  it('resolves correct revision status flags and labels', () => {
    expect(resolveRevisionStatus(null)).toEqual({
      isRemoteDraft: false,
      isPendingReview: false,
      isRejected: false,
      reviewerNotes: null,
      statusText: 'Live Content',
    });

    const pendingRev: ContentRevision = {
      id: 'rev-2',
      contentItemId: mockContent.id,
      authorId: 'auth-1',
      status: CONTENT_STATUS.pendingReview,
      payloadJson: '{}',
      reviewerNotes: null,
      creationTime: '2026-01-01T00:00:00Z',
      lastModificationTime: null,
    };
    expect(resolveRevisionStatus(pendingRev).statusText).toBe('In Review');

    const rejectedRev: ContentRevision = {
      id: 'rev-3',
      contentItemId: mockContent.id,
      authorId: 'auth-1',
      status: CONTENT_STATUS.rejected,
      payloadJson: '{}',
      reviewerNotes: 'Please fix typo in section 2',
      creationTime: '2026-01-01T00:00:00Z',
      lastModificationTime: null,
    };
    const rejectedStatus = resolveRevisionStatus(rejectedRev);
    expect(rejectedStatus.statusText).toBe('Changes Requested');
    expect(rejectedStatus.reviewerNotes).toBe('Please fix typo in section 2');
    expect(rejectedStatus.isRejected).toBe(true);
  });

  it('resolves correct status flags and labels for new content submissions', () => {
    const pendingContent: ContentDetail = {
      ...mockContent,
      status: CONTENT_STATUS.pendingReview,
    };
    const pendingStatus = resolveRevisionStatus(pendingContent, null);
    expect(pendingStatus.isPendingReview).toBe(true);
    expect(pendingStatus.statusText).toBe('Pending Review');

    const inReviewContent: ContentDetail = {
      ...mockContent,
      status: CONTENT_STATUS.inReview,
    };
    const inReviewStatus = resolveRevisionStatus(inReviewContent, null);
    expect(inReviewStatus.isPendingReview).toBe(true);
    expect(inReviewStatus.statusText).toBe('In Review');

    const approvedContent: ContentDetail = {
      ...mockContent,
      status: CONTENT_STATUS.approved,
    };
    expect(resolveRevisionStatus(approvedContent, null).statusText).toBe('Approved');

    const rejectedContent: ContentDetail = {
      ...mockContent,
      status: CONTENT_STATUS.rejected,
      reviewNote: 'Need better audio quality',
    };
    const rejectedStatus = resolveRevisionStatus(rejectedContent, null);
    expect(rejectedStatus.isRejected).toBe(true);
    expect(rejectedStatus.statusText).toBe('Changes Requested');
    expect(rejectedStatus.reviewerNotes).toBe('Need better audio quality');
  });

  describe('normalizeDisplayOrders', () => {
    it('auto-assigns sequential order (0, 1, 2) when displayOrder is null or undefined', () => {
      const items = [
        { id: '1', title: 'First', displayOrder: null },
        { id: '2', title: 'Second', displayOrder: undefined },
        { id: '3', title: 'Third' },
      ];
      const normalized = normalizeDisplayOrders(items);
      expect(normalized.map((i) => i.displayOrder)).toEqual([0, 1, 2]);
    });

    it('auto-assigns sequential order (0, 1, 2) when multiple items have duplicate default 0s', () => {
      const items = [
        { id: '1', title: 'First', displayOrder: 0 },
        { id: '2', title: 'Second', displayOrder: 0 },
        { id: '3', title: 'Third', displayOrder: 0 },
      ];
      const normalized = normalizeDisplayOrders(items);
      expect(normalized.map((i) => i.displayOrder)).toEqual([0, 1, 2]);
    });

    it('preserves existing distinct sort orders', () => {
      const items = [
        { id: '2', title: 'Second', displayOrder: 1 },
        { id: '1', title: 'First', displayOrder: 0 },
        { id: '3', title: 'Third', displayOrder: 2 },
      ];
      const normalized = normalizeDisplayOrders(items);
      expect(normalized.map((i) => i.id)).toEqual(['1', '2', '3']);
      expect(normalized.map((i) => i.displayOrder)).toEqual([0, 1, 2]);
    });

    it('createLiveCurriculum applies displayOrder to sections and lessons', () => {
      const curriculum = createLiveCurriculum(mockContent, 'course');
      expect(curriculum?.sections[0]?.displayOrder).toBe(0);
      expect(curriculum?.sections[0]?.lessons[0]?.displayOrder).toBe(0);
    });
  });
});
