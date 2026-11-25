import { describe, expect, it } from 'vitest';
import type { HttpClient } from '@core/http';
import { isOk } from '@core/result';
import { silentLogger } from '@testing';
import { HttpQuizGateway } from './http-quiz-gateway';
import { Quiz } from '../domain';

const notImplemented = (): never => {
  throw new Error('not used in this test');
};

describe('HttpQuizGateway', () => {
  const sampleQuiz = new Quiz({
    id: 'quiz-1',
    contentId: 'tutorial-1',
    contentKind: 'tutorial',
    title: 'Tutorial Quiz',
    passingPercentage: 80,
    questions: [
      {
        id: 'q1',
        prompt: '1 + 3 =?',
        options: ['3', '4', '2+2', '9'],
        optionIds: ['opt-1', 'opt-2', 'opt-3', 'opt-4'],
        correctIndexes: [],
      },
    ],
  });

  it('submits selected option IDs to backend POST /api/app/quizzes/{id}/submit and returns graded result', async () => {
    let requestedPath = '';
    let postedBody: unknown = null;

    const httpClient: HttpClient = {
      get: notImplemented,
      post: <TResponse>(path: string, body?: unknown): Promise<TResponse> => {
        requestedPath = path;
        postedBody = body;
        return Promise.resolve({
          passed: true,
          score: 100,
          correctCount: 1,
          totalCount: 1,
          passingPercentage: 80,
        }) as Promise<TResponse>;
      },
      put: notImplemented,
      patch: notImplemented,
      delete: notImplemented,
      postForm: notImplemented,
    };

    const gateway = new HttpQuizGateway({ httpClient, logger: silentLogger() });
    const result = await gateway.submit('quiz-1', { q1: [1] }, sampleQuiz);

    expect(requestedPath).toBe('/api/app/quizzes/quiz-1/submit');
    expect(postedBody).toEqual({
      answers: {
        q1: ['opt-2'],
      },
    });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.passed).toBe(true);
      expect(result.value.scorePct).toBe(100);
      expect(result.value.correct).toBe(1);
      expect(result.value.total).toBe(1);
    }
  });

  it('preserves optionIds when fetching quiz via getById', async () => {
    const httpClient: HttpClient = {
      get: <TResponse>(path: string): Promise<TResponse> => {
        expect(path).toBe('/api/app/quizzes/quiz-1');
        return Promise.resolve({
          id: 'quiz-1',
          title: 'Tutorial Quiz',
          questions: [
            {
              id: 'q1',
              quizId: 'quiz-1',
              prompt: '1 + 3 =?',
              options: [
                { id: 'opt-1', text: '3', isCorrect: null },
                { id: 'opt-2', text: '4', isCorrect: null },
              ],
            },
          ],
        }) as Promise<TResponse>;
      },
      post: notImplemented,
      put: notImplemented,
      patch: notImplemented,
      delete: notImplemented,
      postForm: notImplemented,
    };

    const gateway = new HttpQuizGateway({ httpClient, logger: silentLogger() });
    const result = await gateway.getById('quiz-1');

    expect(isOk(result)).toBe(true);
    if (isOk(result) && result.value !== null) {
      expect(result.value.questions[0]?.optionIds).toEqual(['opt-1', 'opt-2']);
      expect(result.value.questions[0]?.options).toEqual(['3', '4']);
    }
  });
});
