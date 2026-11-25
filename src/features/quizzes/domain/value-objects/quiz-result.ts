/* eslint-disable max-params, complexity */
export type QuizStatus = 'not_attempted' | 'passed' | 'failed';

/**
 * The graded outcome of a quiz attempt. A value object: immutable, compared by value, and it owns
 * the pass/fail rule so no component re-derives it. Built via {@link QuizResult.from}, never `new`.
 */
export class QuizResult {
  private constructor(
    public readonly correct: number,
    public readonly total: number,
    public readonly scorePct: number,
    public readonly passingPercentage: number,
    public readonly isMultipleAttemptAllowed = true,
    public readonly attemptNumber = 1,
    public readonly attemptCount = 1,
    public readonly quizVersion = 1,
    public readonly status: QuizStatus = 'not_attempted',
    public readonly recentAttemptScore: number | null = null,
    public readonly answers: Record<string, string[]> | null = null,
    public readonly bestScore: number | null = null,
    public readonly bestPassed: boolean | null = null,
    public readonly bestAttemptNumber: number | null = null,
    public readonly isNewBest = false,
  ) {}

  /** Grade `correct` out of `total` against a percentage `passingPercentage` (0–100). */
  public static from(
    correct: number,
    total: number,
    passingPercentage: number,
    isMultipleAttemptAllowed = true,
    attemptNumber = 1,
    attemptCount = 1,
    quizVersion = 1,
    recentAttemptScore: number | null = null,
    answers: Record<string, string[]> | null = null,
    bestScore: number | null = null,
    bestPassed: boolean | null = null,
    bestAttemptNumber: number | null = null,
    isNewBest = false,
  ): QuizResult {
    const scorePct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const passed = scorePct >= passingPercentage;
    return new QuizResult(
      correct,
      total,
      scorePct,
      passingPercentage,
      isMultipleAttemptAllowed,
      attemptNumber,
      attemptCount,
      quizVersion,
      passed ? 'passed' : 'failed',
      recentAttemptScore,
      answers,
      bestScore,
      bestPassed,
      bestAttemptNumber,
      isNewBest,
    );
  }

  /** True when the score meets or exceeds the passing percentage. */
  public get passed(): boolean {
    return this.scorePct >= this.passingPercentage;
  }
}
