import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudioSidebar } from './CourseStudioSidebar';
import type { Section } from './upload-content-types';
import type { StudioSelection } from './CourseStudioStep';

describe('CourseStudioSidebar', () => {
  it('renders [1] badge and Untitled Section when title is empty', () => {
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: '',
        lessons: [
          {
            id: 'les-1',
            title: '',
            kind: 'video',
          },
        ],
      },
    ];

    render(
      <StudioSidebar
        sections={sections}
        onSections={vi.fn()}
        selection={{ type: 'course' }}
        setSelection={vi.fn()}
      />,
    );

    // Index badges
    const badges = screen.getAllByText('[1]');
    expect(badges.length).toBe(2); // One for section, one for lesson

    // Fallback titles
    expect(screen.getByText('Untitled Section')).toBeInTheDocument();
    expect(screen.getByText('Untitled Lesson')).toBeInTheDocument();
  });

  it('renders [1] badge and custom titles when provided', () => {
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Getting Started',
        lessons: [
          {
            id: 'les-1',
            title: 'Welcome Video',
            kind: 'video',
          },
        ],
      },
    ];

    render(
      <StudioSidebar
        sections={sections}
        onSections={vi.fn()}
        selection={{ type: 'course' }}
        setSelection={vi.fn()}
      />,
    );

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Welcome Video')).toBeInTheDocument();
  });

  it('triggers setSelection when clicking section or lesson node', () => {
    const setSelection = vi.fn<(s: StudioSelection) => void>();
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Module 1',
        lessons: [
          {
            id: 'les-1',
            title: 'Lesson 1.1',
            kind: 'video',
          },
        ],
      },
    ];

    render(
      <StudioSidebar
        sections={sections}
        onSections={vi.fn()}
        selection={{ type: 'course' }}
        setSelection={setSelection}
      />,
    );

    fireEvent.click(screen.getByText('Module 1'));
    expect(setSelection).toHaveBeenCalledWith({ type: 'section', sectionId: 'sec-1' });

    fireEvent.click(screen.getByText('Lesson 1.1'));
    expect(setSelection).toHaveBeenCalledWith({
      type: 'lesson',
      lessonId: 'les-1',
      sectionId: 'sec-1',
    });
  });

  it('renders different content type icons for each lesson type', () => {
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Module 1',
        lessons: [
          { id: 'les-1', title: 'Video Lesson', kind: 'video' },
          { id: 'les-2', title: 'Doc Lesson', kind: 'pdf' },
          { id: 'les-3', title: 'Quiz Lesson', kind: 'quiz' },
          { id: 'les-4', title: 'Assignment Lesson', kind: 'assignment' },
          { id: 'les-5', title: 'Link Lesson', kind: 'link' },
        ],
      },
    ];

    render(
      <StudioSidebar
        sections={sections}
        onSections={vi.fn()}
        selection={{ type: 'course' }}
        setSelection={vi.fn()}
      />,
    );

    expect(screen.getByTestId('lesson-type-icon-video')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-type-icon-pdf')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-type-icon-quiz')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-type-icon-assignment')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-type-icon-link')).toBeInTheDocument();
  });
});
