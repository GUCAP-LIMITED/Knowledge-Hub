import { useState, type ReactElement } from 'react';
import { Button, Modal } from '@shared/ui';
import type { Quiz, QuizContentKind, QuizProps } from '../domain';
import { QuizBuilderBody } from './QuizBuilderBody';
import { draftFromQuiz, draftToProps } from './quiz-draft';
import styles from './QuizSection.module.css';

export interface QuizBuilderModalProps {
  readonly open: boolean;
  readonly existing: Quiz | null;
  readonly contentId: string;
  readonly contentKind: QuizContentKind;
  readonly isSaving: boolean;
  readonly onClose: () => void;
  readonly onSave: (props: QuizProps) => void;
}

/** Admin authoring modal: title, pass mark, and a variable list of questions. */
export const QuizBuilderModal = ({
  open,
  existing,
  contentId,
  contentKind,
  isSaving,
  onClose,
  onSave,
}: QuizBuilderModalProps): ReactElement => {
  const [draft, setDraft] = useState(() => draftFromQuiz(existing));

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title={existing === null ? 'Create quiz' : 'Edit quiz'}
      size="lg"
      footer={
        <div className={styles.builderFoot}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            isLoading={isSaving}
            onClick={() => {
              onSave(draftToProps(draft, existing, contentId, contentKind));
            }}
          >
            Save quiz
          </Button>
        </div>
      }
    >
      <QuizBuilderBody draft={draft} setDraft={setDraft} />
    </Modal>
  );
};
