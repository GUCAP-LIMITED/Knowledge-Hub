import { describe, expect, it } from 'vitest';
import { ok } from '@core/result';
import { FakeQuizGateway, silentLogger } from '@testing';
import { Quiz } from '../../domain';
import { SubmitQuizUseCase } from './submit-quiz';

const quiz = new Quiz({
  id: 'quiz-1',
  contentId: 'course-1',
  contentKind: 'course',
  title: 'Test',
  passMark: 50,
  questions: [{ id: 'a', prompt: 'A?', options: ['x', 'y'], correctIndex: 1 }],
});

describe('SubmitQuizUseCase', () => {
  it('grades against the found quiz', async () => {
    const gateway = new FakeQuizGateway();
    gateway.findResult = ok(quiz);
    const useCase = new SubmitQuizUseCase({
      quizGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute('course-1', { a: 1 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.passed).toBe(true);
    }
  });

  it('errors when no quiz exists for the content', async () => {
    const gateway = new FakeQuizGateway();
    gateway.findResult = ok(null);
    const useCase = new SubmitQuizUseCase({
      quizGateway: gateway,
      logger: silentLogger(),
    });

    const result = await useCase.execute('missing', {});

    expect(result.ok).toBe(false);
  });
});
