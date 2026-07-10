import type { ReactElement } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { Alert, Spinner } from '@shared/ui';
import type { Quiz, QuizContentKind, QuizProps, QuizResult } from '../domain';
import type { SubmitQuizInput } from './use-quizzes';
import { QuizList } from './QuizList';
import { QuizBuild } from './QuizBuild';
import { QuizContent } from './QuizContent';

export type QuizMode = 'list' | 'take' | 'build';

export interface QuizManagerBodyProps {
  readonly quizzes: UseQueryResult<readonly Quiz[]>;
  readonly mode: QuizMode;
  readonly active: Quiz | null;
  readonly result: QuizResult | null;
  readonly attempt: number;
  readonly isAdmin: boolean;
  readonly contentId: string;
  readonly contentKind: QuizContentKind;
  readonly isSaving: boolean;
  readonly deletingId: string | null;
  readonly submit: UseMutationResult<QuizResult, Error, SubmitQuizInput>;
  readonly onList: () => void;
  readonly onPersist: (props: QuizProps) => void;
  readonly onTake: (quiz: Quiz) => void;
  readonly onAdd: () => void;
  readonly onEdit: (quiz: Quiz) => void;
  readonly onDelete: (quiz: Quiz) => void;
  readonly onRetake: () => void;
  readonly onResult: (result: QuizResult) => void;
}

/** Loading / error / build / take / list body of the quiz manager modal. */
export const QuizManagerBody = (props: QuizManagerBodyProps): ReactElement => {
  const { quizzes, mode, active } = props;
  if (quizzes.isLoading) {
    return <Spinner size="md" label="Loading quizzes" />;
  }
  if (quizzes.isError) {
    return (
      <Alert tone="error" title="Quizzes unavailable">
        {quizzes.error.message}
      </Alert>
    );
  }
  if (mode === 'build') {
    return (
      <QuizBuild
        existing={active}
        contentId={props.contentId}
        contentKind={props.contentKind}
        isSaving={props.isSaving}
        onCancel={props.onList}
        onSave={props.onPersist}
      />
    );
  }
  if (mode === 'take' && active !== null) {
    return (
      <QuizContent
        quiz={active}
        result={props.result}
        attempt={props.attempt}
        isSubmitting={props.submit.isPending}
        rewatchLabel="Back to quizzes"
        onRewatch={props.onList}
        onRetake={props.onRetake}
        onSubmit={(answers) => {
          props.submit.mutate(
            { quizId: active.id, answers },
            { onSuccess: props.onResult },
          );
        }}
      />
    );
  }
  return (
    <QuizList
      quizzes={quizzes.data ?? []}
      isAdmin={props.isAdmin}
      deletingId={props.deletingId}
      onTake={props.onTake}
      onAdd={props.onAdd}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
    />
  );
};
