export interface QuizQuestionProps {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly string[];
  /** Indexes into `options` of every correct answer (one or more — "select all that apply"). */
  readonly correctIndexes: readonly number[];
}

const sameSet = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && [...a].sort().every((value, i) => value === [...b].sort()[i]);

/**
 * One multiple-answer question. Immutable and self-checking: whether a selection is correct is the
 * question's own decision (tell-don't-ask) — callers never compare indices themselves. A question
 * may have several correct options; the learner must pick exactly that set.
 */
export class QuizQuestion {
  public readonly id: string;
  public readonly prompt: string;
  public readonly options: readonly string[];
  public readonly correctIndexes: readonly number[];

  public constructor(props: QuizQuestionProps) {
    this.id = props.id;
    this.prompt = props.prompt;
    this.options = props.options;
    this.correctIndexes = props.correctIndexes;
  }

  /** True when the selected option indexes are exactly the correct set. */
  public isCorrect(selectedIndexes: readonly number[]): boolean {
    return sameSet(selectedIndexes, this.correctIndexes);
  }
}
