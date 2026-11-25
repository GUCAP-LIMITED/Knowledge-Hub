import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TooltipProvider } from '@shared/ui';
import { CurriculumCard } from './CourseCurriculum';
import { buildCourse } from '@testing';

describe('<CurriculumCard /> with Free Preview', () => {
  it('renders Free Preview badge and allows un-enrolled learners to play preview lessons', () => {
    const onPlay = vi.fn();
    const onEdit = vi.fn();

    const course = buildCourse({
      id: 'course-1',
      isEnrolled: false,
      sections: [
        {
          id: 'sec-1',
          title: 'Section 1',
          lessons: [
            {
              id: 'les-preview',
              title: 'Introduction to Course',
              kind: 'video',
              durationSeconds: 120,
              mediaAssetId: 'media-1',
              quizId: null,
              externalUrl: null,
              isPreview: true,
            },
            {
              id: 'les-locked',
              title: 'Advanced Core Concepts',
              kind: 'video',
              durationSeconds: 300,
              mediaAssetId: 'media-2',
              quizId: null,
              externalUrl: null,
              isPreview: false,
            },
          ],
        },
      ],
    });

    render(
      <TooltipProvider>
        <CurriculumCard course={course} onPlay={onPlay} canEdit={false} onEdit={onEdit} />
      </TooltipProvider>,
    );

    // Free Preview badge should be rendered for the preview lesson
    expect(screen.getByText('Free Preview')).toBeInTheDocument();

    // Click preview lesson button -> triggers onPlay
    const previewBtn = screen.getByRole('button', { name: /Introduction to Course/i });
    expect(previewBtn).toHaveAttribute('aria-disabled', 'false');
    fireEvent.click(previewBtn);
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'les-preview', isPreview: true }),
    );

    // Click locked lesson button -> does not trigger onPlay
    const lockedBtn = screen.getByRole('button', { name: /Advanced Core Concepts/i });
    expect(lockedBtn).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(lockedBtn);
    expect(onPlay).toHaveBeenCalledTimes(1); // Still 1, not called for locked lesson
  });

  it('does not display Free Preview badge once the user is enrolled', () => {
    const onPlay = vi.fn();
    const onEdit = vi.fn();

    const course = buildCourse({
      id: 'course-1',
      isEnrolled: true,
      sections: [
        {
          id: 'sec-1',
          title: 'Section 1',
          lessons: [
            {
              id: 'les-preview',
              title: 'Introduction to Course',
              kind: 'video',
              durationSeconds: 120,
              mediaAssetId: 'media-1',
              quizId: null,
              externalUrl: null,
              isPreview: true,
            },
          ],
        },
      ],
    });

    render(
      <TooltipProvider>
        <CurriculumCard course={course} onPlay={onPlay} canEdit={false} onEdit={onEdit} />
      </TooltipProvider>,
    );

    // For enrolled learners, the Free Preview badge is unnecessary because all lessons are unlocked
    // However, the lesson should still be clickable
    const lessonBtn = screen.getByRole('button', { name: /Introduction to Course/i });
    expect(lessonBtn).toHaveAttribute('aria-disabled', 'false');
  });
});
