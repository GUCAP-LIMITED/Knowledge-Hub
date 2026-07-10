/**
 * The graded outcome of a quiz attempt. A value object: immutable, compared by value, and it owns
 * the pass/fail rule so no component re-derives it. Built via {@link QuizResult.from}, never `new`.
 */
export class QuizResult {
  private constructor(
    public readonly correct: number,
    public readonly total: number,
    public readonly scorePct: number,
    public readonly passMark: number,
  ) {}

  /** Grade `correct` out of `total` against a percentage `passMark` (0–100). */
  public static from(correct: number, total: number, passMark: number): QuizResult {
    const scorePct = total === 0 ? 0 : Math.round((correct / total) * 100);
    return new QuizResult(correct, total, scorePct, passMark);
  }

  /** True when the score meets or exceeds the pass mark. */
  public get passed(): boolean {
    return this.scorePct >= this.passMark;
  }
}
