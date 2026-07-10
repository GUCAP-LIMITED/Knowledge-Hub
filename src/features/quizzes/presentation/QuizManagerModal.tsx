import { useState, type ReactElement } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, Modal } from '@shared/ui';
import type { Quiz, QuizContentKind, QuizProps, QuizResult } from '../domain';
import { useDeleteQuiz, useQuizzes, useSaveQuiz, useSubmitQuiz } from './use-quizzes';
import { QuizManagerBody, type QuizMode } from './QuizManagerBody';

export interface QuizManagerModalProps {
  readonly open: boolean;
  readonly contentId: string;
  readonly contentKind: QuizContentKind;
  readonly contentTitle: string;
  readonly isAdmin: boolean;
  readonly onClose: () => void;
}

/** The single place to manage a content's quizzes: list, take, and (admin) author multiple. */
export const QuizManagerModal = (props: QuizManagerModalProps): ReactElement => {
  const { open, contentId, contentKind, contentTitle, isAdmin, onClose } = props;
  const quizzes = useQuizzes(contentId);
  const save = useSaveQuiz();
  const del = useDeleteQuiz();
  const submit = useSubmitQuiz();
  const [mode, setMode] = useState<QuizMode>('list');
  const [active, setActive] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  const toList = (): void => {
    setMode('list');
    setActive(null);
    setResult(null);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title={`Quizzes · ${contentTitle}`}
      size="lg"
    >
      {mode !== 'list' ? (
        <Button variant="ghost" size="sm" onClick={toList}>
          <ArrowLeft size={14} aria-hidden /> Back to quizzes
        </Button>
      ) : null}

      <QuizManagerBody
        quizzes={quizzes}
        mode={mode}
        active={active}
        result={result}
        attempt={attempt}
        isAdmin={isAdmin}
        contentId={contentId}
        contentKind={contentKind}
        isSaving={save.isPending}
        deletingId={del.isPending ? del.variables.quizId : null}
        submit={submit}
        onList={toList}
        onPersist={(quizProps: QuizProps) => {
          save.mutate(quizProps, { onSuccess: toList });
        }}
        onTake={(quiz) => {
          setActive(quiz);
          setResult(null);
          setMode('take');
        }}
        onAdd={() => {
          setActive(null);
          setMode('build');
        }}
        onEdit={(quiz) => {
          setActive(quiz);
          setMode('build');
        }}
        onDelete={(quiz) => {
          del.mutate({ quizId: quiz.id, contentId });
        }}
        onRetake={() => {
          setResult(null);
          setAttempt((n) => n + 1);
        }}
        onResult={setResult}
      />
    </Modal>
  );
};
