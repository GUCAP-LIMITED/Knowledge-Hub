import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizBuilder } from './QuizBuilder';
import type { QuizConfig } from './upload-content-types';

describe('QuizBuilder - Upgrade Quiz Version Toggle', () => {
  it('renders dynamic upgrade text when upgradeQuiz is true and version is known', () => {
    const quiz: QuizConfig = {
      id: 'quiz-1',
      title: 'Math Quiz',
      version: 1,
      upgradeQuiz: true,
      passingPercentage: 80,
      isMultipleAttemptAllowed: true,
      questions: [],
    };

    render(<QuizBuilder quiz={quiz} onChange={vi.fn()} />);

    expect(screen.getByText('Upgrade Quiz Version')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Upgrades to v2\. Learners who already took this quiz get a fresh attempt\./i,
      ),
    ).toBeInTheDocument();
  });

  it('renders dynamic in-place text when upgradeQuiz is false and version is known', () => {
    const quiz: QuizConfig = {
      id: 'quiz-1',
      title: 'Math Quiz',
      version: 1,
      upgradeQuiz: false,
      passingPercentage: 80,
      isMultipleAttemptAllowed: true,
      questions: [],
    };

    render(<QuizBuilder quiz={quiz} onChange={vi.fn()} />);

    expect(screen.getByText('Upgrade Quiz Version')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Keeps v1\. Minor in-place edit; existing learner attempts and scores are preserved\./i,
      ),
    ).toBeInTheDocument();
  });

  it('fires onChange with upgradeQuiz = false when user toggles switch off', () => {
    const handleChange = vi.fn();
    const quiz: QuizConfig = {
      id: 'quiz-1',
      title: 'Math Quiz',
      version: 2,
      upgradeQuiz: true,
      passingPercentage: 80,
      isMultipleAttemptAllowed: true,
      questions: [],
    };

    render(<QuizBuilder quiz={quiz} onChange={handleChange} />);

    const toggle = screen.getByRole('switch', { name: /upgrade quiz version/i });
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        upgradeQuiz: false,
      }),
    );
  });
});
