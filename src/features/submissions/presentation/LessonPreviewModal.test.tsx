import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LESSON_KIND } from '@features/content';
import type * as ContentFeature from '@features/content';
import { LessonPreviewModal } from './LessonPreviewModal';
import type { EditableLesson } from './types';

const mockUseGetMediaReadSas = vi.fn();

vi.mock(
  '@features/content',
  async (importOriginal: () => Promise<typeof ContentFeature>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      useGetMediaReadSas: (...args: unknown[]) => mockUseGetMediaReadSas(...args),
      useGetQuiz: vi.fn(() => ({ data: null, isLoading: false })),
    };
  },
);

vi.mock('@features/courses', () => ({
  useAssignmentBriefs: vi.fn(() => ({ data: [], isLoading: false })),
}));

describe('LessonPreviewModal - Quiz Version Badge', () => {
  beforeEach(() => {
    mockUseGetMediaReadSas.mockReturnValue({ data: null, isLoading: false });
  });

  it('renders "Version Upgrade: v1 → v2" when upgradeQuiz is true', () => {
    const lesson: EditableLesson = {
      id: 'lesson-1',
      title: 'Quiz Lesson 1',
      kind: LESSON_KIND.quiz,
      durationSeconds: 0,
      displayOrder: 0,
      isPreview: false,
      mediaAssetId: null,
      externalUrl: null,
      quizId: 'quiz-1',
      quiz: {
        id: 'quiz-1',
        title: 'Quiz Lesson 1',
        version: 1,
        upgradeQuiz: true,
        passingPercentage: 80,
        isMultipleAttemptAllowed: true,
        questions: [
          {
            id: 'q1',
            prompt: 'Question 1',
            options: [
              { id: 'o1', text: 'Option 1', isCorrect: true },
              { id: 'o2', text: 'Option 2', isCorrect: false },
            ],
          },
        ],
      },
    };

    render(
      <LessonPreviewModal
        lesson={lesson}
        contentId="content-1"
        sectionTitle="Section 1"
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Version Upgrade: v1 → v2')).toBeInTheDocument();
  });

  it('renders "In-Place Edit: v1" when upgradeQuiz is false', () => {
    const lesson: EditableLesson = {
      id: 'lesson-1',
      title: 'Quiz Lesson 1',
      kind: LESSON_KIND.quiz,
      durationSeconds: 0,
      displayOrder: 0,
      isPreview: false,
      mediaAssetId: null,
      externalUrl: null,
      quizId: 'quiz-1',
      quiz: {
        id: 'quiz-1',
        title: 'Quiz Lesson 1',
        version: 1,
        upgradeQuiz: false,
        passingPercentage: 80,
        isMultipleAttemptAllowed: true,
        questions: [
          {
            id: 'q1',
            prompt: 'Question 1',
            options: [
              { id: 'o1', text: 'Option 1', isCorrect: true },
              { id: 'o2', text: 'Option 2', isCorrect: false },
            ],
          },
        ],
      },
    };

    render(
      <LessonPreviewModal
        lesson={lesson}
        contentId="content-1"
        sectionTitle="Section 1"
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('In-Place Edit: v1')).toBeInTheDocument();
  });
});

describe('LessonPreviewModal - Assignment Lesson Staged Brief Files', () => {
  it('renders "Open in new tab" when staged brief file receives SAS URL', () => {
    mockUseGetMediaReadSas.mockImplementation(
      (_cid: string, blobName: string | undefined) => {
        if (blobName === 'blob-capture.PNG') {
          return {
            data: 'https://storage.azure.com/briefs/blob-capture.PNG?token=123',
            isLoading: false,
          };
        }
        return { data: null, isLoading: false };
      },
    );

    const lesson: EditableLesson = {
      id: 'lesson-assign-1',
      title: 'Assignment Lesson',
      kind: LESSON_KIND.assignment,
      durationSeconds: 0,
      displayOrder: 0,
      isPreview: false,
      mediaAssetId: null,
      externalUrl: null,
      quizId: null,
      assignmentFiles: [
        {
          id: 'file-1',
          azureBlobName: 'blob-capture.PNG',
          originalFileName: 'Capddddture.PNG',
          mimeType: 'image/png',
          sizeBytes: 173670,
          kind: 10,
          slot: 12,
          previewUrl: null,
        },
      ],
    };

    render(
      <LessonPreviewModal
        lesson={lesson}
        contentId="content-1"
        sectionTitle="Section 1"
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Capddddture.PNG')).toBeInTheDocument();
    expect(screen.getByText('Open in new tab')).toBeInTheDocument();
    expect(screen.queryByText('No direct URL')).not.toBeInTheDocument();
  });

  it('renders "No direct URL" when staged file has neither direct URL nor SAS URL', () => {
    mockUseGetMediaReadSas.mockReturnValue({ data: null, isLoading: false });

    const lesson: EditableLesson = {
      id: 'lesson-assign-2',
      title: 'Assignment Lesson Without URL',
      kind: LESSON_KIND.assignment,
      durationSeconds: 0,
      displayOrder: 0,
      isPreview: false,
      mediaAssetId: null,
      externalUrl: null,
      quizId: null,
      assignmentFiles: [
        {
          id: 'file-2',
          azureBlobName: '',
          originalFileName: 'Unuploaded.PNG',
          mimeType: null,
          sizeBytes: 5000,
          kind: 10,
          slot: 12,
          previewUrl: null,
        },
      ],
    };

    render(
      <LessonPreviewModal
        lesson={lesson}
        contentId="content-1"
        sectionTitle="Section 1"
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Unuploaded.PNG')).toBeInTheDocument();
    expect(screen.getByText('No direct URL')).toBeInTheDocument();
  });
});
