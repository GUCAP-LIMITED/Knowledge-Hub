import type { ReactElement } from 'react';
import { Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState, IconButton } from '@shared/ui';
import type { Quiz } from '../domain';
import styles from './QuizSection.module.css';

export interface QuizListProps {
  readonly quizzes: readonly Quiz[];
  readonly isAdmin: boolean;
  readonly deletingId: string | null;
  readonly onTake: (quiz: Quiz) => void;
  readonly onAdd: () => void;
  readonly onEdit: (quiz: Quiz) => void;
  readonly onDelete: (quiz: Quiz) => void;
}

/** List of a content's quizzes with take (all) and edit/delete (admin) actions. */
export const QuizList = ({
  quizzes,
  isAdmin,
  deletingId,
  onTake,
  onAdd,
  onEdit,
  onDelete,
}: QuizListProps): ReactElement => (
  <div className={styles.list}>
    {quizzes.length === 0 ? (
      <EmptyState
        title="No quizzes yet"
        description={
          isAdmin
            ? 'Add one so learners can test themselves.'
            : 'No quizzes are available for this content yet.'
        }
      />
    ) : (
      quizzes.map((quiz) => (
        <div key={quiz.id} className={styles.listRow}>
          <button
            type="button"
            className={styles.listMain}
            onClick={() => {
              onTake(quiz);
            }}
          >
            <span className={styles.listTitle}>{quiz.title}</span>
            <span className={styles.listMeta}>
              {quiz.questionCount} question{quiz.questionCount === 1 ? '' : 's'} ·{' '}
              {quiz.passMark}% to pass
            </span>
          </button>
          <div className={styles.listActions}>
            <IconButton
              label={`Take ${quiz.title}`}
              onClick={() => {
                onTake(quiz);
              }}
            >
              <Play size={15} aria-hidden />
            </IconButton>
            {isAdmin ? (
              <>
                <IconButton
                  label={`Edit ${quiz.title}`}
                  onClick={() => {
                    onEdit(quiz);
                  }}
                >
                  <Pencil size={15} aria-hidden />
                </IconButton>
                <IconButton
                  label={`Delete ${quiz.title}`}
                  variant="danger"
                  disabled={deletingId === quiz.id}
                  onClick={() => {
                    onDelete(quiz);
                  }}
                >
                  <Trash2 size={15} aria-hidden />
                </IconButton>
              </>
            ) : null}
          </div>
        </div>
      ))
    )}
    {isAdmin ? (
      <Button variant="accent" onClick={onAdd}>
        <Plus size={16} aria-hidden /> Add quiz
      </Button>
    ) : null}
  </div>
);
