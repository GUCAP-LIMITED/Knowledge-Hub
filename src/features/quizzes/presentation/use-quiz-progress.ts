import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuizProgressState {
  /** contentId → whether the learner has passed a quiz for that content. */
  readonly passed: Record<string, boolean>;
  readonly markPassed: (contentId: string) => void;
}

/**
 * Client-only record of which content the learner has passed the quiz for. No backend, so it lives
 * in localStorage; the course page reads it to gate the certificate behind a passing attempt.
 */
export const useQuizProgressStore = create<QuizProgressState>()(
  persist(
    (set) => ({
      passed: {},
      markPassed: (contentId): void => {
        set((state) => ({ passed: { ...state.passed, [contentId]: true } }));
      },
    }),
    { name: 'kh.quiz-progress.v1' },
  ),
);

/** Whether the learner has passed a quiz for this content (reactive). */
export const useQuizPassed = (contentId: string): boolean =>
  useQuizProgressStore((state) => state.passed[contentId] === true);
