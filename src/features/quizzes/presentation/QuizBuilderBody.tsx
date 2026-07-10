import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { Plus } from 'lucide-react';
import { Button, TextField } from '@shared/ui';
import { QuizQuestionEditor } from './QuizQuestionEditor';
import { type DraftQuestion, type QuizDraft, blankQuestion } from './quiz-draft';
import styles from './QuizSection.module.css';

export interface QuizBuilderBodyProps {
  readonly draft: QuizDraft;
  readonly setDraft: Dispatch<SetStateAction<QuizDraft>>;
}

/** Editable fields of the quiz builder: title, pass mark, and the question list. */
export const QuizBuilderBody = ({
  draft,
  setDraft,
}: QuizBuilderBodyProps): ReactElement => {
  // Apply the updater to one question inside a functional state update, so rapid successive
  // edits (e.g. toggling two correct answers quickly) never read stale question state.
  const updateQuestion = (
    index: number,
    updater: (question: DraftQuestion) => DraftQuestion,
  ): void => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? updater(q) : q)),
    }));
  };

  return (
    <div className={styles.builder}>
      <div className={styles.builderTop}>
        <TextField
          label="Quiz title"
          value={draft.title}
          onChange={(event) => {
            setDraft((prev) => ({ ...prev, title: event.target.value }));
          }}
        />
        <TextField
          label="Pass mark (%)"
          type="number"
          value={String(draft.passMark)}
          onChange={(event) => {
            setDraft((prev) => ({ ...prev, passMark: Number(event.target.value) }));
          }}
        />
      </div>
      {draft.questions.map((question, index) => (
        <QuizQuestionEditor
          key={question.id}
          index={index}
          question={question}
          canRemove={draft.questions.length > 1}
          onChange={(updater) => {
            updateQuestion(index, updater);
          }}
          onRemove={() => {
            setDraft((prev) => ({
              ...prev,
              questions: prev.questions.filter((_, i) => i !== index),
            }));
          }}
        />
      ))}
      <Button
        variant="secondary"
        onClick={() => {
          setDraft((prev) => ({
            ...prev,
            questions: [...prev.questions, blankQuestion()],
          }));
        }}
      >
        <Plus size={16} aria-hidden /> Add question
      </Button>
    </div>
  );
};
