import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Quiz } from '../domain';
import { QuizAnswersSlider } from './QuizAnswersSlider';

const sampleQuiz = new Quiz({
  id: 'quiz-test-1',
  contentId: 'course-1',
  contentKind: 'course',
  title: 'Math Quiz',
  passingPercentage: 60,
  questions: [
    {
      id: 'q1',
      prompt: '1 + 4 = ?',
      options: ['5', '3', '4'],
      correctIndexes: [0],
    },
    {
      id: 'q2',
      prompt: '9 + 4 = ?',
      options: ['6', '13', '5+8'],
      correctIndexes: [1, 2],
    },
  ],
});

describe('QuizAnswersSlider', () => {
  it('renders the first question prompt and submitted answers', () => {
    // q1 option 0 has id opt-0 by default from domain
    const opt0Id = sampleQuiz.questions[0]?.optionIds[0] ?? 'opt-0';
    const userAnswers: Record<string, string[]> = {
      q1: [opt0Id],
      q2: [],
    };

    render(<QuizAnswersSlider quiz={sampleQuiz} userAnswers={userAnswers} />);

    expect(screen.getByText('1 + 4 = ?')).toBeDefined();
    expect(screen.getByText('Question 1 of 2')).toBeDefined();
    expect(screen.getByText('Your Answer')).toBeDefined();
  });

  it('slides to the next question when clicking Next button or Question pill', () => {
    const q2Opt1Id = sampleQuiz.questions[1]?.optionIds[1] ?? 'opt-1';
    const userAnswers: Record<string, string[]> = {
      q1: [],
      q2: [q2Opt1Id],
    };

    render(<QuizAnswersSlider quiz={sampleQuiz} userAnswers={userAnswers} />);

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /next question/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('9 + 4 = ?')).toBeDefined();
    expect(screen.getByText('Question 2 of 2')).toBeDefined();
    expect(screen.getByText('Your Answer')).toBeDefined();

    // Previous is now enabled
    const prevBtn = screen.getByRole('button', { name: /previous question/i });
    expect((prevBtn as HTMLButtonElement).disabled).toBe(false);

    // Click Previous
    fireEvent.click(prevBtn);
    expect(screen.getByText('1 + 4 = ?')).toBeDefined();

    // Click pill '2' to jump
    const pill2 = screen.getByRole('button', { name: /go to question 2/i });
    fireEvent.click(pill2);
    expect(screen.getByText('9 + 4 = ?')).toBeDefined();
  });

  it('renders previous attempt banner and tag when isPreviousAttempt is true', () => {
    const userAnswers: Record<string, string[]> = {
      q1: ['opt-0'],
      q2: [], // not answered in previous attempt
    };

    render(
      <QuizAnswersSlider quiz={sampleQuiz} userAnswers={userAnswers} isPreviousAttempt />,
    );

    expect(
      screen.getByText('Submitted answers from your previous attempt'),
    ).toBeDefined();

    // Click next to see unselected question with previous attempt notice
    const nextBtn = screen.getByRole('button', { name: /next question/i });
    fireEvent.click(nextBtn);

    expect(
      screen.getByText('Added in latest version — not in your previous attempt'),
    ).toBeDefined();
  });

  it('returns null when quiz has no questions', () => {
    const emptyQuiz = new Quiz({
      id: 'empty',
      contentId: 'course-1',
      contentKind: 'course',
      title: 'Empty',
      passingPercentage: 50,
      questions: [],
    });

    const { container } = render(<QuizAnswersSlider quiz={emptyQuiz} userAnswers={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
