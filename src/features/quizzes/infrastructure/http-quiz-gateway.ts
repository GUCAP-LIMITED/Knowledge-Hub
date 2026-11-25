import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { z } from 'zod';
import {
  Quiz,
  type QuizAnswers,
  type QuizError,
  type QuizGateway,
  type QuizLearnerStatus,
  QuizNotFoundError,
  QuizResult,
  type QuizStatus,
} from '../domain';

const BASE = '/api/app/quizzes';

// DTO Schemas based on Backend
const QuizOptionDtoSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean().nullable().optional(),
});

const QuizQuestionDtoSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  prompt: z.string(),
  displayOrder: z.number().default(0),
  options: z.array(QuizOptionDtoSchema),
});

const QuizDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  passingPercentage: z.number().default(80),
  isMultipleAttemptAllowed: z.boolean().default(true),
  version: z.number().default(1),
  questions: z.array(QuizQuestionDtoSchema),
});

const parseStatus = (val: unknown): QuizStatus => {
  if (val === 1 || val === 'Passed' || val === 'passed') return 'passed';
  if (val === 2 || val === 'Failed' || val === 'failed') return 'failed';
  return 'not_attempted';
};

const QuizResultDtoSchema = z.object({
  passed: z.boolean(),
  score: z.number(),
  correctCount: z.number(),
  totalCount: z.number(),
  passingPercentage: z.number().default(80),
  isMultipleAttemptAllowed: z.boolean().default(true),
  attemptNumber: z.number().default(1),
  attemptCount: z.number().default(1),
  quizVersion: z.number().default(1),
  status: z.union([z.number(), z.string()]).transform(parseStatus).default(0),
  answers: z.record(z.string(), z.array(z.string())).nullable().optional(),
  recentAttemptScore: z.number().nullable().optional(),
  bestScore: z.number().nullable().optional(),
  bestPassed: z.boolean().nullable().optional(),
  bestAttemptNumber: z.number().nullable().optional(),
  isNewBest: z.boolean().default(false),
});

const QuizLearnerStatusDtoSchema = z.object({
  status: z.union([z.number(), z.string()]).transform(parseStatus),
  hasEverPassed: z.boolean().default(false),
  attemptCount: z.number().default(0),
  versionAttemptCount: z.number().default(0),
  canAttempt: z.boolean().default(true),
  isQuizUpdatedSinceLastAttempt: z.boolean().default(false),
  latestResult: QuizResultDtoSchema.nullable().optional(),
  latestAnswers: z.record(z.string(), z.array(z.string())).nullable().optional(),
});

type QuizDto = z.infer<typeof QuizDtoSchema>;

const toQuiz = (dto: QuizDto): Quiz => {
  return new Quiz({
    id: dto.id,
    contentId: '', // Not used by backend
    contentKind: 'course', // Not used by backend
    title: dto.title,
    passingPercentage: dto.passingPercentage,
    isMultipleAttemptAllowed: dto.isMultipleAttemptAllowed,
    version: dto.version,
    questions: dto.questions.map((q) => {
      // Map the object array to string array and compute correct indexes
      const options = q.options.map((o) => o.text);
      const optionIds = q.options.map((o) => o.id);
      const correctIndexes = q.options
        .map((o, index) => (o.isCorrect === true ? index : -1))
        .filter((index) => index !== -1);

      return {
        id: q.id,
        prompt: q.prompt,
        displayOrder: q.displayOrder,
        options,
        optionIds,
        correctIndexes,
      };
    }),
  });
};

export interface HttpQuizGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class HttpQuizGateway implements QuizGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpQuizGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('quiz-gateway');
  }

  public async listByContent(
    contentId: string,
  ): Promise<Result<readonly Quiz[], QuizError>> {
    return this.guard(async () => {
      try {
        const raw = await this.httpClient.get(`${BASE}/${contentId}`);
        const quiz = toQuiz(QuizDtoSchema.parse(raw));
        return [quiz];
      } catch (cause) {
        if (cause instanceof HttpError && cause.status === 404) {
          return [];
        }
        throw cause;
      }
    });
  }

  public async getById(quizId: string): Promise<Result<Quiz | null, QuizError>> {
    return this.guard(async () => {
      try {
        const raw = await this.httpClient.get(`${BASE}/${quizId}`);
        return toQuiz(QuizDtoSchema.parse(raw));
      } catch (cause) {
        if (cause instanceof HttpError && cause.status === 404) {
          return null;
        }
        throw cause;
      }
    });
  }

  public async save(quiz: Quiz): Promise<Result<Quiz, QuizError>> {
    return this.guard(async () => {
      const props = quiz.toProps();

      // Map frontend domain props to backend CreateUpdateQuizDto
      const payload = {
        title: props.title,
        passingPercentage: props.passingPercentage,
        isMultipleAttemptAllowed: props.isMultipleAttemptAllowed,
        questions: props.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options.map((optText, index) => ({
            id: null, // Backend will generate ID if null
            text: optText,
            isCorrect: q.correctIndexes.includes(index),
          })),
        })),
      };

      let raw;
      try {
        raw = await this.httpClient.put(`${BASE}/${quiz.id}`, payload);
      } catch (cause) {
        if (cause instanceof HttpError && cause.status === 404) {
          raw = await this.httpClient.post(BASE, payload);
        } else {
          throw cause;
        }
      }
      return toQuiz(QuizDtoSchema.parse(raw));
    });
  }

  public async remove(quizId: string): Promise<Result<void, QuizError>> {
    return this.guard(async () => {
      await this.httpClient.delete(`${BASE}/${quizId}`);
    });
  }

  public async submit(
    quizId: string,
    answers: QuizAnswers,
    quiz: Quiz,
  ): Promise<Result<QuizResult, QuizError>> {
    return this.guard(async () => {
      const answersPayload: Record<string, string[]> = {};
      for (const question of quiz.questions) {
        const selectedIndexes = answers[question.id] ?? [];
        answersPayload[question.id] = selectedIndexes
          .map((idx) => question.optionIds[idx])
          .filter((id): id is string => typeof id === 'string');
      }

      const raw = await this.httpClient.post(`${BASE}/${quizId}/submit`, {
        answers: answersPayload,
      });
      const res = QuizResultDtoSchema.parse(raw);
      return QuizResult.from(
        res.correctCount,
        res.totalCount,
        res.passingPercentage,
        res.isMultipleAttemptAllowed,
        res.attemptNumber,
        res.attemptCount,
        res.quizVersion,
        res.recentAttemptScore ?? null,
        res.answers ?? null,
        res.bestScore ?? null,
        res.bestPassed ?? null,
        res.bestAttemptNumber ?? null,
        res.isNewBest,
      );
    });
  }

  public async getMyStatus(
    quizId: string,
  ): Promise<Result<QuizLearnerStatus, QuizError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.get(`${BASE}/${quizId}/my-status`);
      const dto = QuizLearnerStatusDtoSchema.parse(raw);
      const latestResult = dto.latestResult
        ? QuizResult.from(
            dto.latestResult.correctCount,
            dto.latestResult.totalCount,
            dto.latestResult.passingPercentage,
            dto.latestResult.isMultipleAttemptAllowed,
            dto.latestResult.attemptNumber,
            dto.latestResult.attemptCount,
            dto.latestResult.quizVersion,
            dto.latestResult.recentAttemptScore ?? null,
            dto.latestResult.answers ?? dto.latestAnswers ?? null,
            dto.latestResult.bestScore ?? null,
            dto.latestResult.bestPassed ?? null,
            dto.latestResult.bestAttemptNumber ?? null,
            dto.latestResult.isNewBest,
          )
        : null;

      return {
        status: dto.status,
        hasEverPassed: dto.hasEverPassed,
        attemptCount: dto.attemptCount,
        versionAttemptCount: dto.versionAttemptCount,
        canAttempt: dto.canAttempt,
        isQuizUpdatedSinceLastAttempt: dto.isQuizUpdatedSinceLastAttempt,
        latestResult,
        latestAnswers: dto.latestAnswers ?? null,
      };
    });
  }

  private async guard<T>(fn: () => Promise<T>): Promise<Result<T, QuizError>> {
    try {
      return ok(await fn());
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Quiz request failed', cause, { status });
      if (status === 404) {
        return err(new QuizNotFoundError('API returned 404'));
      }
      return err(new Error('Quizzes API unavailable') as QuizError);
    }
  }
}
