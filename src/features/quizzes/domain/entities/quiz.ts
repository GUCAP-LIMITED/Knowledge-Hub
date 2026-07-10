import { QuizQuestion, type QuizQuestionProps } from './quiz-question';
import { QuizResult } from '../value-objects/quiz-result';

/** The kind of catalog content a quiz is attached to. */
export type QuizContentKind = 'course' | 'tutorial' | 'resource';

/** Learner answers: question id → chosen option index. */
export type QuizAnswers = Readonly<Record<string, number>>;

export interface QuizProps {
  readonly id: string;
  readonly contentId: string;
  readonly contentKind: QuizContentKind;
  readonly title: string;
  /** Percentage (0–100) a learner must reach to pass. */
  readonly passMark: number;
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
  public readonly passMark: number;
  public readonly questions: readonly QuizQuestion[];

  public constructor(props: QuizProps) {
    this.id = props.id;
    this.contentId = props.contentId;
    this.contentKind = props.contentKind;
    this.title = props.title;
    this.passMark = clampPct(props.passMark);
    this.questions = props.questions.map((q) => new QuizQuestion(q));
  }

  /** Number of questions in the quiz. */
  public get questionCount(): number {
    return this.questions.length;
  }

  /** Grade a set of answers against the questions and pass mark. */
  public grade(answers: QuizAnswers): QuizResult {
    const correct = this.questions.reduce(
      (total, question) =>
        total + (question.isCorrect(answers[question.id] ?? -1) ? 1 : 0),
      0,
    );
    return QuizResult.from(correct, this.questions.length, this.passMark);
  }

  /** Return a copy with a new pass mark (clamped to 0–100). */
  public withPassMark(passMark: number): Quiz {
    return new Quiz({ ...this.toProps(), passMark });
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
      passMark: this.passMark,
      questions: this.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
      })),
    };
  }
}

const clampPct = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));
