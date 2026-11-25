import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { UploadFileStep } from './UploadFileStep';
import { LearnerPreview } from './LearnerPreview';
import type { QuizConfig } from './upload-content-types';
import { EMPTY_DETAILS } from './upload-details';

describe('Tutorial Quiz requirement verification', () => {
  it('shows "+ Add Quiz" button when tutorial has no quiz attached', () => {
    const onQuizChange = vi.fn<(quiz: QuizConfig | null) => void>();
    render(
      <UploadFileStep
        slots={[]}
        files={{}}
        onChange={vi.fn()}
        contentType="tutorial"
        quiz={null}
        onQuizChange={onQuizChange}
      />,
    );

    const addBtn = screen.getByRole('button', { name: /\+ Add Quiz/i });
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(onQuizChange).toHaveBeenCalledTimes(1);
    const addedQuiz = onQuizChange.mock.calls[0]?.[0];
    expect(addedQuiz?.isRequired).toBe(true);
  });

  it('renders requirement toggle defaulting to ON with Mandatory badge when quiz is configured', () => {
    const onQuizChange = vi.fn();
    const sampleQuiz: QuizConfig = {
      title: 'Sample Tutorial Quiz',
      isRequired: true,
      questions: [
        {
          id: 'q1',
          prompt: 'What is Vite?',
          options: [
            { id: 'opt1', text: 'Build tool', isCorrect: true },
            { id: 'opt2', text: 'Database', isCorrect: false },
          ],
        },
      ],
    };

    render(
      <UploadFileStep
        slots={[]}
        files={{}}
        onChange={vi.fn()}
        contentType="tutorial"
        quiz={sampleQuiz}
        onQuizChange={onQuizChange}
      />,
    );

    expect(screen.getByText('Require Quiz Submission to Complete')).toBeInTheDocument();
    expect(screen.getByText('Mandatory')).toBeInTheDocument();

    const switchBtn = screen.getByRole('switch', {
      name: /Require quiz submission to complete tutorial/i,
    });
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(switchBtn);
    expect(onQuizChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isRequired: false,
      }),
    );
  });

  it('renders Optional Practice badge when isRequired is false', () => {
    const sampleQuiz: QuizConfig = {
      title: 'Sample Tutorial Quiz',
      isRequired: false,
      questions: [
        {
          id: 'q1',
          prompt: 'What is Vite?',
          options: [
            { id: 'opt1', text: 'Build tool', isCorrect: true },
            { id: 'opt2', text: 'Database', isCorrect: false },
          ],
        },
      ],
    };

    render(
      <UploadFileStep
        slots={[]}
        files={{}}
        onChange={vi.fn()}
        contentType="tutorial"
        quiz={sampleQuiz}
        onQuizChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Optional Practice')).toBeInTheDocument();
    const switchBtn = screen.getByRole('switch', {
      name: /Require quiz submission to complete tutorial/i,
    });
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');
  });

  it('LearnerPreview reflects Required vs Optional status of quiz', () => {
    const details = {
      ...EMPTY_DETAILS,
      type: 'Tutorial',
      title: 'Getting Started',
      description: 'Quick start tutorial',
      category: 'Tech',
      difficulty: 'Beginner',
      duration: '5',
    };

    const requiredQuiz: QuizConfig = {
      title: 'Tutorial Quiz',
      isRequired: true,
      questions: [
        {
          id: 'q1',
          prompt: 'Question 1',
          options: [{ text: 'A', isCorrect: true }],
        },
      ],
    };

    const { rerender } = render(
      <LearnerPreview
        details={details}
        sections={[]}
        quiz={requiredQuiz}
        author="Admin"
        compact={false}
      />,
    );

    expect(screen.getByText(/1 Quiz question · Required/i)).toBeInTheDocument();

    const optionalQuiz: QuizConfig = {
      ...requiredQuiz,
      isRequired: false,
    };

    rerender(
      <LearnerPreview
        details={details}
        sections={[]}
        quiz={optionalQuiz}
        author="Admin"
        compact={false}
      />,
    );

    expect(screen.getByText(/1 Quiz question · Optional/i)).toBeInTheDocument();
  });
});
