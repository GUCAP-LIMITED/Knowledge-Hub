import { useState, type ReactElement } from 'react';
import { ClipboardList, Pencil } from 'lucide-react';
import { Alert, Button, Spinner } from '@shared/ui';
import type { QuizContentKind, QuizProps, QuizResult } from '../domain';
import { useQuiz, useSaveQuiz, useSubmitQuiz } from './use-quizzes';
import { QuizContent } from './QuizContent';
import { QuizBuilderModal } from './QuizBuilderModal';
import styles from './QuizSection.module.css';

export interface QuizSectionProps {
  readonly contentId: string;
  readonly contentKind: QuizContentKind;
  readonly isAdmin: boolean;
  /** Revisit the underlying content after a failed attempt. */
  readonly onRewatch: () => void;
  readonly rewatchLabel: string;
}

const QuizHeader = ({
  title,
  isAdmin,
  hasQuiz,
  onEdit,
}: {
  readonly title: string;
  readonly isAdmin: boolean;
  readonly hasQuiz: boolean;
  readonly onEdit: () => void;
}): ReactElement => (
  <header className={styles.head}>
    <h2 className={styles.title}>
      <ClipboardList size={18} aria-hidden /> {title}
    </h2>
    {isAdmin ? (
      <Button size="sm" variant="secondary" onClick={onEdit}>
        <Pencil size={14} aria-hidden /> {hasQuiz ? 'Edit quiz' : 'Create quiz'}
      </Button>
    ) : null}
  </header>
);

/** Quiz block for a content page: learner take/grade flow plus admin authoring. */
export const QuizSection = (props: QuizSectionProps): ReactElement | null => {
  const { contentId, contentKind, isAdmin, onRewatch, rewatchLabel } = props;
  const quiz = useQuiz(contentId);
  const submit = useSubmitQuiz();
  const save = useSaveQuiz();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [builderOpen, setBuilderOpen] = useState(false);

  if (quiz.isLoading) {
    return <Spinner size="md" label="Loading quiz" />;
  }
  if (quiz.isError) {
    return (
      <Alert tone="error" title="Quiz unavailable">
        {quiz.error.message}
      </Alert>
    );
  }

  const data = quiz.data ?? null;
  if (data === null && !isAdmin) {
    return null;
  }

  const retake = (): void => {
    setResult(null);
    setAttempt((n) => n + 1);
  };

  const persist = (quizProps: QuizProps): void => {
    save.mutate(quizProps, {
      onSuccess: () => {
        setBuilderOpen(false);
        retake();
      },
    });
  };

  return (
    <div className={styles.section}>
      <QuizHeader
        title={data?.title ?? 'Quiz'}
        isAdmin={isAdmin}
        hasQuiz={data !== null}
        onEdit={() => {
          setBuilderOpen(true);
        }}
      />

      {data === null ? (
        <p className={styles.empty}>
          No quiz yet. Create one so learners can test themselves.
        </p>
      ) : (
        <QuizContent
          quiz={data}
          result={result}
          attempt={attempt}
          isSubmitting={submit.isPending}
          rewatchLabel={rewatchLabel}
          onRetake={retake}
          onRewatch={onRewatch}
          onSubmit={(answers) => {
            submit.mutate({ contentId, answers }, { onSuccess: setResult });
          }}
        />
      )}

      {builderOpen ? (
        <QuizBuilderModal
          open={builderOpen}
          existing={data}
          contentId={contentId}
          contentKind={contentKind}
          isSaving={save.isPending}
          onClose={() => {
            setBuilderOpen(false);
          }}
          onSave={persist}
        />
      ) : null}
    </div>
  );
};
