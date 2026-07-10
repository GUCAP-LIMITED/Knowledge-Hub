import { describe, expect, it } from 'vitest';
import { Quiz, type QuizProps } from './quiz';

const props: QuizProps = {
  id: 'quiz-1',
  contentId: 'course-1',
  contentKind: 'course',
  title: 'Test',
  passMark: 50,
  questions: [
    { id: 'a', prompt: 'A?', options: ['x', 'y', 'z'], correctIndexes: [1, 2] },
    { id: 'b', prompt: 'B?', options: ['x', 'y'], correctIndexes: [0] },
  ],
};

describe('Quiz.grade', () => {
  it('passes when every answer set matches exactly', () => {
    const result = new Quiz(props).grade({ a: [2, 1], b: [0] });
    expect(result.correct).toBe(2);
    expect(result.scorePct).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('marks a partial multi-answer selection as incorrect', () => {
    const result = new Quiz(props).grade({ a: [1], b: [1] });
    expect(result.correct).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('treats missing answers as incorrect and is exactly at the pass mark', () => {
    const result = new Quiz(props).grade({ b: [0] });
    expect(result.correct).toBe(1);
    expect(result.scorePct).toBe(50);
    expect(result.passed).toBe(true);
  });

  it('clamps an out-of-range pass mark', () => {
    expect(new Quiz({ ...props, passMark: 200 }).passMark).toBe(100);
  });
});
