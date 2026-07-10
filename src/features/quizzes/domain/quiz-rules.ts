import type { QuizProps } from './entities/quiz';

/**
 * Validate a quiz's shape before it is saved. Returns a human-readable reason when the quiz is
 * invalid, or `null` when it is publishable. Shared by the save use case (authoritative check) and
 * the authoring UI (to disable Save and explain why) so the two never drift.
 */
export const quizPropsError = (props: QuizProps): string | null => {
  if (props.questions.length === 0) {
    return 'a quiz needs at least one question';
  }
  for (const question of props.questions) {
    if (question.prompt.trim() === '') {
      return 'every question needs a prompt';
    }
    if (question.options.length < 2) {
      return 'every question needs at least two answers';
    }
    if (question.correctIndexes.length === 0) {
      return 'every question needs at least one correct answer';
    }
    const outOfRange = question.correctIndexes.some(
      (index) => index < 0 || index >= question.options.length,
    );
    if (outOfRange) {
      return 'every correct answer must reference a real option';
    }
  }
  return null;
};
