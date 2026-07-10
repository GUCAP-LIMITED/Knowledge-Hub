import type { Quiz, QuizContentKind, QuizProps } from '../domain';

export interface DraftQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
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

/** A fresh empty question with two blank options. */
export const blankQuestion = (): DraftQuestion => ({
  id: nextQuizId('q'),
  prompt: '',
  options: ['', ''],
  correctIndex: 0,
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
          correctIndex: q.correctIndex,
        })),
      };

/** Assemble the persistable quiz props from a draft, trimming empty option slots. */
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
    options: q.options.map((o) => o.trim()).filter((o) => o !== ''),
    correctIndex: q.correctIndex,
  })),
});
