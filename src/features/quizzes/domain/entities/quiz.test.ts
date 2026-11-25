import { describe, expect, it } from 'vitest';
import { Quiz, type QuizProps } from './quiz';

const props: QuizProps = {
  id: 'quiz-1',
  contentId: 'course-1',
  contentKind: 'course',
  title: 'Test',
  passingPercentage: 50,
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

  it('treats missing answers as incorrect and is exactly at the passing percentage', () => {
    const result = new Quiz(props).grade({ b: [0] });
    expect(result.correct).toBe(1);
    expect(result.scorePct).toBe(50);
    expect(result.passed).toBe(true);
  });

  it('clamps an out-of-range passing percentage', () => {
    expect(new Quiz({ ...props, passingPercentage: 200 }).passingPercentage).toBe(100);
  });

  it('sorts questions strictly by displayOrder regardless of input order', () => {
    const unsortedProps: QuizProps = {
      ...props,
      questions: [
        {
          id: 'q3',
          prompt: 'Q3',
          displayOrder: 2,
          options: ['a', 'b'],
          correctIndexes: [0],
        },
        {
          id: 'q1',
          prompt: 'Q1',
          displayOrder: 0,
          options: ['a', 'b'],
          correctIndexes: [0],
        },
        {
          id: 'q2',
          prompt: 'Q2',
          displayOrder: 1,
          options: ['a', 'b'],
          correctIndexes: [0],
        },
      ],
    };
    const quiz = new Quiz(unsortedProps);
    expect(quiz.questions.map((q) => q.id)).toEqual(['q1', 'q2', 'q3']);
    expect(quiz.questions[0]?.displayOrder).toBe(0);
    expect(quiz.questions[1]?.displayOrder).toBe(1);
    expect(quiz.questions[2]?.displayOrder).toBe(2);
  });
});
