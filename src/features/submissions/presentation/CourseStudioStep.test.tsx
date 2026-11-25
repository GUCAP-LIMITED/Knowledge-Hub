import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseStudioStep } from './CourseStudioStep';
import { SubmitAttemptContext } from './submit-attempt-context';
import type { Section } from './upload-content-types';

const StudioHarness = ({
  initialSections,
}: {
  readonly initialSections: readonly Section[];
}): ReactElement => {
  const [sections, setSections] = useState(initialSections);
  return (
    <CourseStudioStep
      slots={[]}
      files={{}}
      onFiles={vi.fn()}
      sections={sections}
      onSections={setSections}
    />
  );
};

describe('CourseStudioStep', () => {
  it('renders section details with ordinal header and learner preview', () => {
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
      <CourseStudioStep
        slots={[]}
        files={{}}
        onFiles={vi.fn()}
        sections={sections}
        onSections={vi.fn()}
      />,
    );

    // Click on Section 1 in the sidebar to open SectionEditorPanel
    fireEvent.click(screen.getByText('Untitled Section'));

    // Should display Section 1 Details header
    expect(
      screen.getByRole('heading', { name: /Section 1 Details/i }),
    ).toBeInTheDocument();

    // Should display Learner preview hint
    const previewContainer = screen.getByText(/Learner preview:/i).parentElement;
    expect(previewContainer).toHaveTextContent('Section 1: Untitled Section');
  });

  it('updates learner preview when typing section title', () => {
    const onSections = vi.fn();
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Intro',
        lessons: [],
      },
    ];

    render(
      <CourseStudioStep
        slots={[]}
        files={{}}
        onFiles={vi.fn()}
        sections={sections}
        onSections={onSections}
      />,
    );

    fireEvent.click(screen.getByText('Intro'));

    const input = screen.getByRole('textbox', { name: /Section Title/i });
    expect(input).toHaveValue('Intro');

    const previewContainer = screen.getByText(/Learner preview:/i).parentElement;
    expect(previewContainer).toHaveTextContent('Section 1: Intro');

    fireEvent.change(input, { target: { value: 'Introduction to Web Dev' } });
    expect(onSections).toHaveBeenCalledWith([
      { id: 'sec-1', title: 'Introduction to Web Dev', lessons: [] },
    ]);
  });

  it('renders lesson details with ordinal header and learner preview', () => {
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Module 1',
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
      <CourseStudioStep
        slots={[]}
        files={{}}
        onFiles={vi.fn()}
        sections={sections}
        onSections={vi.fn()}
      />,
    );

    // Click on Lesson 1 in the sidebar
    fireEvent.click(screen.getByText('Untitled Lesson'));

    // Header
    expect(
      screen.getByRole('heading', { name: /Lesson 1 Details/i }),
    ).toBeInTheDocument();

    // Untouched lesson should NOT immediately display validation error
    expect(screen.queryByText(/Lesson title is required/i)).not.toBeInTheDocument();

    // Preview
    const previewContainer = screen.getByText(/Learner preview:/i).parentElement;
    expect(previewContainer).toHaveTextContent('Untitled Lesson');
  });

  it('renders external URL input for link lesson and updates sections on change', () => {
    const onSections = vi.fn();
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Module 1',
        lessons: [
          {
            id: 'les-link',
            title: 'Official Documentation',
            kind: 'link',
            externalUrl: 'https://react.dev',
          },
        ],
      },
    ];

    render(
      <CourseStudioStep
        slots={[]}
        files={{}}
        onFiles={vi.fn()}
        sections={sections}
        onSections={onSections}
      />,
    );

    fireEvent.click(screen.getByText('Official Documentation'));

    const urlInput = screen.getByRole('textbox', { name: /External Resource URL/i });
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveValue('https://react.dev');

    fireEvent.change(urlInput, { target: { value: 'https://typescriptlang.org' } });
    expect(onSections).toHaveBeenCalledWith([
      {
        id: 'sec-1',
        title: 'Module 1',
        lessons: [
          {
            id: 'les-link',
            title: 'Official Documentation',
            kind: 'link',
            externalUrl: 'https://typescriptlang.org',
          },
        ],
      },
    ]);
  });

  it('displays validation error when entering an invalid external URL for link lesson', () => {
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Module 1',
        lessons: [
          {
            id: 'les-link',
            title: 'Docs',
            kind: 'link',
            externalUrl: '',
          },
        ],
      },
    ];

    render(<StudioHarness initialSections={sections} />);

    fireEvent.click(screen.getByText('Docs'));

    const urlInput = screen.getByRole('textbox', { name: /External Resource URL/i });
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });

    expect(
      screen.getByText(/Please enter a valid URL starting with http:\/\/ or https:\/\//i),
    ).toBeInTheDocument();
  });

  it('jumps to the course media panel and lists what blocks publishing after a blocked publish', () => {
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: 'Intro',
        lessons: [{ id: 'les-1', title: 'Welcome', kind: 'link' }],
      },
    ];
    const renderAt = (attempt: number): ReactElement => (
      <SubmitAttemptContext.Provider value={attempt}>
        <CourseStudioStep
          slots={[]}
          files={{}}
          onFiles={vi.fn()}
          sections={sections}
          onSections={vi.fn()}
        />
      </SubmitAttemptContext.Provider>
    );
    const { rerender } = render(renderAt(0));

    fireEvent.click(screen.getByText('Intro'));
    expect(
      screen.getByRole('heading', { name: /Section 1 Details/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('1 thing left before you can publish'),
    ).not.toBeInTheDocument();

    rerender(renderAt(1));

    expect(screen.getByRole('heading', { name: 'Course Media' })).toBeInTheDocument();
    expect(screen.getByText('1 thing left before you can publish')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Course thumbnail is missing');
  });

  it('jumps to a listed issue when its summary item is selected', () => {
    const sections: Section[] = [
      {
        id: 'sec-1',
        title: '',
        lessons: [{ id: 'les-1', title: 'Welcome', kind: 'link' }],
      },
    ];
    render(
      <SubmitAttemptContext.Provider value={1}>
        <CourseStudioStep
          slots={[]}
          files={{ thumbnail: [new File(['x'], 't.png', { type: 'image/png' })] }}
          onFiles={vi.fn()}
          sections={sections}
          onSections={vi.fn()}
        />
      </SubmitAttemptContext.Provider>,
    );

    // The blocked attempt already jumped to the untitled section; go elsewhere, then back.
    fireEvent.click(screen.getByText('Course Settings'));
    expect(screen.getByRole('heading', { name: 'Course Media' })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Section 1: All section titles/ }),
    );

    expect(
      screen.getByRole('heading', { name: /Section 1 Details/i }),
    ).toBeInTheDocument();
  });
});
