export interface QuizQuestionProps {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly string[];
  /** Index into `options` of the single correct answer. */
  readonly correctIndex: number;
}

/**
 * One multiple-choice question. Immutable and self-checking: whether an answer is correct is the
 * question's own decision (tell-don't-ask) — callers never compare indices themselves.
 */
export class QuizQuestion {
  public readonly id: string;
  public readonly prompt: string;
  public readonly options: readonly string[];
  public readonly correctIndex: number;

  public constructor(props: QuizQuestionProps) {
    this.id = props.id;
    this.prompt = props.prompt;
    this.options = props.options;
    this.correctIndex = props.correctIndex;
  }

  /** True when the given option index is the correct answer. */
  public isCorrect(selectedIndex: number): boolean {
    return selectedIndex === this.correctIndex;
  }
}
