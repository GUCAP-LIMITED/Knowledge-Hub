import { QuizQuestion, type QuizQuestionProps } from './quiz-question';
import { QuizResult } from '../value-objects/quiz-result';

/** The kind of catalog content a quiz is attached to. */
export type QuizContentKind = 'course' | 'tutorial' | 'resource';

/** Learner answers: question id → chosen option indexes (one or more). */
export type QuizAnswers = Readonly<Record<string, readonly number[]>>;

export interface QuizProps {
  readonly id: string;
  readonly contentId: string;
  readonly contentKind: QuizContentKind;
  readonly title: string;
  /** Percentage (0–100, decimals allowed) a learner must reach to pass. */
  readonly passingPercentage?: number | undefined;
  readonly isMultipleAttemptAllowed?: boolean | undefined;
  readonly version?: number | undefined;
  readonly questions: readonly QuizQuestionProps[];
}

/**
 * A quiz attached to one piece of content. Aggregate root over its questions and the pass rule:
 * grading and "how many questions" are answered here, never pulled apart by the UI. Immutable —
 * admin edits return a new `Quiz`.
 */
export class Quiz {
  public readonly id: string;
  public readonly contentId: string;
  public readonly contentKind: QuizContentKind;
  public readonly title: string;
  public readonly passingPercentage: number;
  public readonly isMultipleAttemptAllowed: boolean;
  public readonly version: number;
  public readonly questions: readonly QuizQuestion[];

  public constructor(props: QuizProps) {
    this.id = props.id;
    this.contentId = props.contentId;
    this.contentKind = props.contentKind;
    this.title = props.title;
    this.passingPercentage = clampPct(props.passingPercentage ?? 80);
    this.isMultipleAttemptAllowed = props.isMultipleAttemptAllowed ?? true;
    this.version = props.version ?? 1;
    this.questions = [...props.questions]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((q) => new QuizQuestion(q));
  }

  /** Number of questions in the quiz. */
  public get questionCount(): number {
    return this.questions.length;
  }

  /** Grade a set of answers against the questions and passing percentage. */
  public grade(answers: QuizAnswers): QuizResult {
    const correct = this.questions.reduce(
      (total, question) =>
        total + (question.isCorrect(answers[question.id] ?? []) ? 1 : 0),
      0,
    );
    return QuizResult.from(
      correct,
      this.questions.length,
      this.passingPercentage,
      this.isMultipleAttemptAllowed,
      1,
      1,
      this.version,
    );
  }

  /** Return a copy with a new passing percentage (clamped to 0–100). */
  public withPassingPercentage(passingPercentage: number): Quiz {
    return new Quiz({ ...this.toProps(), passingPercentage });
  }

  /** Return a copy with a replaced question list. */
  public withQuestions(questions: readonly QuizQuestionProps[]): Quiz {
    return new Quiz({ ...this.toProps(), questions });
  }

  public toProps(): QuizProps {
    return {
      id: this.id,
      contentId: this.contentId,
      contentKind: this.contentKind,
      title: this.title,
      passingPercentage: this.passingPercentage,
      isMultipleAttemptAllowed: this.isMultipleAttemptAllowed,
      version: this.version,
      questions: this.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        displayOrder: q.displayOrder,
        options: q.options,
        optionIds: q.optionIds,
        correctIndexes: q.correctIndexes,
      })),
    };
  }
}

const clampPct = (value: number): number =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 80));
