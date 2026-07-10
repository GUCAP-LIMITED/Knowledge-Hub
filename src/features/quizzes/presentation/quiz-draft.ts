import type { Quiz, QuizContentKind, QuizProps } from '../domain';

/** Max characters for a question prompt (mirrors the authoring counter). */
export const PROMPT_MAX = 150;

export interface DraftQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly string[];
  /** Indexes into `options` marked correct (one or more). */
  readonly correctIndexes: readonly number[];
}

export interface QuizDraft {
  readonly title: string;
  readonly passMark: number;
  readonly questions: readonly DraftQuestion[];
}

let sequence = 0;

/** Monotonic client-side id for draft questions (deterministic, no clock/random). */
export const nextQuizId = (prefix: string): string => {
  sequence += 1;
  return `${prefix}-${String(sequence)}`;
};

/** A fresh empty question with three blank answers. */
export const blankQuestion = (): DraftQuestion => ({
  id: nextQuizId('q'),
  prompt: '',
  options: ['', '', ''],
  correctIndexes: [],
});

/** Build an editable draft from an existing quiz, or a starter draft when none exists. */
export const draftFromQuiz = (quiz: Quiz | null): QuizDraft =>
  quiz === null
    ? { title: 'Knowledge check', passMark: 60, questions: [blankQuestion()] }
    : {
        title: quiz.title,
        passMark: quiz.passMark,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
          correctIndexes: q.correctIndexes,
        })),
      };

// Drop blank answers and remap the correct indexes to the surviving option positions.
const compactQuestion = (
  question: DraftQuestion,
): { options: readonly string[]; correctIndexes: readonly number[] } => {
  const kept: string[] = [];
  const remap = new Map<number, number>();
  question.options.forEach((option, index) => {
    const trimmed = option.trim();
    if (trimmed !== '') {
      remap.set(index, kept.length);
      kept.push(trimmed);
    }
  });
  const correctIndexes = question.correctIndexes
    .map((index) => remap.get(index))
    .filter((index): index is number => index !== undefined);
  return { options: kept, correctIndexes };
};

/** Assemble the persistable quiz props from a draft, trimming empty answer slots. */
export const draftToProps = (
  draft: QuizDraft,
  existing: Quiz | null,
  contentId: string,
  contentKind: QuizContentKind,
): QuizProps => ({
  id: existing?.id ?? nextQuizId('quiz'),
  contentId,
  contentKind,
  title: draft.title.trim() === '' ? 'Knowledge check' : draft.title.trim(),
  passMark: draft.passMark,
  questions: draft.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt.trim(),
    ...compactQuestion(q),
  })),
});
