import { can, notFound, patch, requireUser } from '../mock-context';
import { nextId, type MockQuizAttempt, type MockState } from '../mock-state';
import type { MockRequest, MockRoute } from '../mock-types';
import type { QuizSeed } from '../seed/quiz-seed';

const BASE = '/api/app/quizzes';

const findQuiz = (state: MockState, id: string): QuizSeed => {
  const quiz = state.quizzes.find((q) => q.id === id);
  if (quiz === undefined) {
    throw notFound('Quiz');
  }
  return quiz;
};

const toDto = (quiz: QuizSeed, includeAnswers: boolean): Record<string, unknown> => ({
  id: quiz.id,
  title: quiz.title,
  passingPercentage: quiz.passingPercentage,
  isMultipleAttemptAllowed: quiz.isMultipleAttemptAllowed,
  version: quiz.version,
  questions: quiz.questions.map((q, index) => ({
    id: q.id,
    quizId: quiz.id,
    prompt: q.prompt,
    displayOrder: index,
    options: q.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: includeAnswers ? o.isCorrect : null,
    })),
  })),
});

const attemptsOf = (
  state: MockState,
  userId: string,
  quizId: string,
): MockQuizAttempt[] => state.quizAttempts.get(`${userId}:${quizId}`) ?? [];

const resultDto = (
  quiz: QuizSeed,
  attempts: readonly MockQuizAttempt[],
  attempt: MockQuizAttempt,
): Record<string, unknown> => {
  const best = attempts.reduce((a, b) => (b.score > a.score ? b : a), attempt);
  return {
    passed: attempt.passed,
    score: attempt.score,
    correctCount: attempt.correctCount,
    totalCount: attempt.totalCount,
    passingPercentage: quiz.passingPercentage,
    isMultipleAttemptAllowed: quiz.isMultipleAttemptAllowed,
    attemptNumber: attempt.attemptNumber,
    attemptCount: attempts.length,
    quizVersion: attempt.version,
    status: attempt.passed ? 1 : 2,
    answers: attempt.answers,
    recentAttemptScore: attempt.score,
    bestScore: best.score,
    bestPassed: best.passed,
    bestAttemptNumber: best.attemptNumber,
    isNewBest: best.attemptNumber === attempt.attemptNumber,
  };
};

const submit = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const quiz = findQuiz(state, request.params.id ?? '');
  const answers = (request.body as { answers?: Record<string, string[]> }).answers ?? {};
  const correctCount = quiz.questions.filter((q) => {
    const picked = [...(answers[q.id] ?? [])].sort();
    const correct = q.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id)
      .sort();
    return picked.length === correct.length && picked.every((id, i) => id === correct[i]);
  }).length;
  const score = Math.round((correctCount / Math.max(quiz.questions.length, 1)) * 100);
  const attempts = attemptsOf(state, user.id, quiz.id);
  const attempt: MockQuizAttempt = {
    attemptNumber: attempts.length + 1,
    version: quiz.version,
    correctCount,
    totalCount: quiz.questions.length,
    score,
    passed: score >= quiz.passingPercentage,
    answers,
  };
  const next = [...attempts, attempt];
  state.quizAttempts.set(`${user.id}:${quiz.id}`, next);
  return resultDto(quiz, next, attempt);
};

const myStatus = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const quiz = findQuiz(state, request.params.id ?? '');
  const attempts = attemptsOf(state, user.id, quiz.id);
  const latest = attempts[attempts.length - 1];
  return {
    status: latest === undefined ? 0 : latest.passed ? 1 : 2,
    hasEverPassed: attempts.some((a) => a.passed),
    attemptCount: attempts.length,
    versionAttemptCount: attempts.filter((a) => a.version === quiz.version).length,
    canAttempt: quiz.isMultipleAttemptAllowed || attempts.length === 0,
    isQuizUpdatedSinceLastAttempt: latest !== undefined && latest.version < quiz.version,
    latestResult: latest === undefined ? null : resultDto(quiz, attempts, latest),
    latestAnswers: latest?.answers ?? null,
  };
};

interface QuizPayload {
  readonly title: string;
  readonly passingPercentage: number;
  readonly isMultipleAttemptAllowed: boolean;
  readonly questions: readonly {
    readonly id?: string | null;
    readonly prompt: string;
    readonly options: readonly {
      readonly text: string;
      readonly isCorrect?: boolean | null;
    }[];
  }[];
}

const applyPayload = (
  state: MockState,
  quiz: QuizSeed,
  payload: QuizPayload,
): QuizSeed => {
  patch(quiz, {
    title: payload.title,
    passingPercentage: payload.passingPercentage,
    isMultipleAttemptAllowed: payload.isMultipleAttemptAllowed,
    version: quiz.version + 1,
    questions: payload.questions.map((q) => {
      const qid = q.id ?? nextId(state, 'q');
      return {
        id: qid,
        prompt: q.prompt,
        options: q.options.map((o, oi) => ({
          id: `${qid}-o${String(oi + 1)}`,
          text: o.text,
          isCorrect: o.isCorrect === true,
        })),
      };
    }),
  });
  return quiz;
};

export const quizHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      const user = requireUser(request);
      const author =
        can(state, user, 'Courses.Edit') || can(state, user, 'Submissions.Create');
      const wantsAnswers = request.query.includeAnswers !== 'false';
      return toDto(findQuiz(state, request.params.id ?? ''), author && wantsAnswers);
    },
  },
  { method: 'POST', pattern: `${BASE}/:id/submit`, handler: (r) => submit(state, r) },
  { method: 'GET', pattern: `${BASE}/:id/my-status`, handler: (r) => myStatus(state, r) },
  {
    method: 'POST',
    pattern: BASE,
    handler: (request) => {
      const quiz: QuizSeed = {
        id: nextId(state, 'quiz'),
        title: '',
        passingPercentage: 80,
        isMultipleAttemptAllowed: true,
        version: 0,
        questions: [],
      };
      state.quizzes.push(quiz);
      return toDto(applyPayload(state, quiz, request.body as QuizPayload), true);
    },
  },
  {
    method: 'PUT',
    pattern: `${BASE}/:id`,
    handler: (request) =>
      toDto(
        applyPayload(
          state,
          findQuiz(state, request.params.id ?? ''),
          request.body as QuizPayload,
        ),
        true,
      ),
  },
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      const index = state.quizzes.findIndex((q) => q.id === request.params.id);
      if (index >= 0) {
        state.quizzes.splice(index, 1);
      }
      return null;
    },
  },
];
