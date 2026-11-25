import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizResult } from '../domain';
import { BestScoreCard } from './BestScoreCard';

describe('BestScoreCard', () => {
  it('renders first attempt message on initial attempt', () => {
    const result = QuizResult.from(
      1,
      2,
      60,
      true,
      1, // attemptNumber
      1, // attemptCount
      1, // quizVersion
      null,
      null,
      50,
      false,
      1,
      false,
    );

    render(<BestScoreCard result={result} />);

    expect(screen.getByText('First Attempt Recorded')).toBeDefined();
    expect(screen.getByText('Attempt #1')).toBeDefined();
    expect(
      screen.getByText(
        'Your initial attempt is recorded. Review your submitted answers below and feel free to retake when you are ready!',
      ),
    ).toBeDefined();
  });

  it('renders New Personal Best highlight when isNewBest is true on retake', () => {
    const result = QuizResult.from(
      2,
      2,
      60,
      true,
      2, // attemptNumber
      2, // attemptCount
      1, // quizVersion
      null,
      null,
      100, // bestScore
      true,
      2, // bestAttemptNumber
      true, // isNewBest
    );

    render(<BestScoreCard result={result} />);

    expect(screen.getByText('New Personal Best!')).toBeDefined();
    expect(screen.getByText('Attempt #2')).toBeDefined();
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('Highest Grade')).toBeDefined();
  });

  it('renders Highest Score Preserved when previous attempt had higher score', () => {
    // Current attempt (Attempt 4) has 0%, but Attempt 3 scored 50%
    const result = QuizResult.from(
      0,
      2,
      80,
      true,
      4, // attemptNumber
      4, // attemptCount
      1, // quizVersion
      0, // recentAttemptScore
      null,
      50, // bestScore
      false, // bestPassed
      3, // bestAttemptNumber
      false, // isNewBest
    );

    render(<BestScoreCard result={result} />);

    expect(screen.getByText('Highest Score Preserved')).toBeDefined();
    expect(screen.getByText('Achieved in Attempt #3')).toBeDefined();
    expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Your Best Score')).toBeDefined();
    expect(
      screen.getByText(/Your course progress retains your highest score of/i),
    ).toBeDefined();
  });

  it('renders Matched Highest Score when this attempt ties previous best', () => {
    const result = QuizResult.from(
      1,
      2,
      60,
      true,
      3, // attemptNumber
      3, // attemptCount
      1, // quizVersion
      50,
      null,
      50, // bestScore
      false,
      1, // bestAttemptNumber
      false, // isNewBest
    );

    render(<BestScoreCard result={result} />);

    expect(screen.getByText('Matched Highest Score')).toBeDefined();
    expect(screen.getByText('Matched Attempt #1')).toBeDefined();
    expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1);
  });
});
