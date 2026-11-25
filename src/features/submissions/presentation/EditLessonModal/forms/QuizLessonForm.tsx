/* eslint-disable max-lines-per-function, complexity */
import { useEffect, type ReactElement } from 'react';
import { generateGuid, isValidGuid } from '@shared/utils';
import { Spinner, Alert } from '@shared/ui';
import { useGetQuiz } from '@features/content';
import { BaseLessonFields, type BaseLessonFieldsProps } from './BaseLessonFields';
import { QuizBuilder } from '../../QuizBuilder';
import type { QuizConfig, Lesson } from '../../upload-content-types';

export const QuizLessonForm = ({
  draft,
  setDraft,
}: BaseLessonFieldsProps): ReactElement => {
  const rawQuiz = draft.quiz as QuizConfig | undefined;
  const hasDraftQuestions = (rawQuiz?.questions.length ?? 0) > 0;

  const {
    data: fetchedQuiz,
    isLoading: isQuizLoading,
    error,
  } = useGetQuiz(draft.quizId ?? undefined, {
    enabled: Boolean(draft.quizId),
    includeAnswers: !hasDraftQuestions,
  });

  const isLoading = !hasDraftQuestions && isQuizLoading;

  useEffect(() => {
    if (fetchedQuiz && !hasDraftQuestions) {
      setDraft((d) => {
        if (d.quiz && d.quiz.questions.length > 0) {
          return d;
        }
        return {
          ...d,
          quiz: {
            id: fetchedQuiz.id ?? null,
            title:
              fetchedQuiz.title.length > 0
                ? fetchedQuiz.title
                : (d.title ?? 'Lesson Quiz'),
            passingPercentage: fetchedQuiz.passingPercentage ?? 80,
            isMultipleAttemptAllowed: fetchedQuiz.isMultipleAttemptAllowed ?? true,
            upgradeQuiz: d.quiz?.upgradeQuiz ?? true,
            version: fetchedQuiz.version,
            questions: fetchedQuiz.questions
              .slice()
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
              .map((q, idx) => ({
                id: q.id && isValidGuid(q.id) ? q.id : generateGuid(),
                prompt: q.prompt,
                displayOrder: q.displayOrder ?? idx,
                options: q.options.map((o) => ({
                  id: o.id && isValidGuid(o.id) ? o.id : generateGuid(),
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
              })),
          },
        };
      });
    } else if (fetchedQuiz?.version && rawQuiz && rawQuiz.version === undefined) {
      setDraft((d) => {
        if (!d.quiz || d.quiz.version !== undefined) return d;
        return {
          ...d,
          quiz: {
            ...d.quiz,
            version: fetchedQuiz.version,
          },
        };
      });
    }
  }, [fetchedQuiz, hasDraftQuestions, rawQuiz, setDraft]);

  const quizConfig: QuizConfig = {
    id: rawQuiz?.id ?? fetchedQuiz?.id ?? null,
    title: rawQuiz?.title ?? draft.title ?? 'Lesson Quiz',
    passingPercentage: rawQuiz?.passingPercentage ?? fetchedQuiz?.passingPercentage ?? 80,
    isMultipleAttemptAllowed:
      rawQuiz?.isMultipleAttemptAllowed ?? fetchedQuiz?.isMultipleAttemptAllowed ?? true,
    upgradeQuiz: rawQuiz?.upgradeQuiz ?? true,
    version: rawQuiz?.version ?? fetchedQuiz?.version,
    questions: (rawQuiz?.questions ?? []).map((q, idx) => ({
      id: q.id && isValidGuid(q.id) ? q.id : generateGuid(),
      prompt: q.prompt,
      displayOrder: q.displayOrder ?? idx,
      options: q.options.map((o) => ({
        id: o.id && isValidGuid(o.id) ? o.id : generateGuid(),
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    })),
  };

  const handleUpdateLesson = (updated: Lesson): void => {
    setDraft((d) => {
      const currentQuizId = d.quiz?.id;
      return {
        ...d,
        quiz: updated.quiz
          ? {
              id:
                currentQuizId && isValidGuid(currentQuizId)
                  ? currentQuizId
                  : generateGuid(),
              title:
                updated.quiz.title.length > 0
                  ? updated.quiz.title
                  : (d.title ?? 'Lesson Quiz'),
              passingPercentage: updated.quiz.passingPercentage ?? 80,
              isMultipleAttemptAllowed: updated.quiz.isMultipleAttemptAllowed ?? true,
              upgradeQuiz: updated.quiz.upgradeQuiz ?? true,
              version: updated.quiz.version ?? rawQuiz?.version ?? fetchedQuiz?.version,
              questions: updated.quiz.questions.map((q, idx) => ({
                id: q.id && isValidGuid(q.id) ? q.id : generateGuid(),
                prompt: q.prompt,
                displayOrder: q.displayOrder ?? idx,
                options: q.options.map((o) => ({
                  id: o.id && isValidGuid(o.id) ? o.id : generateGuid(),
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
              })),
            }
          : null,
      };
    });
  };

  return (
    <>
      <BaseLessonFields draft={draft} setDraft={setDraft} showDuration={false} />
      <div style={{ marginTop: '1rem' }}>
        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2.5rem',
            }}
          >
            <Spinner size="md" label="Loading existing quiz questions..." />
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <Alert tone="error" title="Failed to load existing quiz">
              {error.message}
            </Alert>
          </div>
        )}

        {!isLoading && (
          <QuizBuilder
            lesson={{
              id: draft.id && isValidGuid(draft.id) ? draft.id : generateGuid(),
              title: draft.title ?? 'Quiz Lesson',
              kind: 'quiz',
              quiz: quizConfig,
            }}
            updateLesson={handleUpdateLesson}
          />
        )}
      </div>
    </>
  );
};
