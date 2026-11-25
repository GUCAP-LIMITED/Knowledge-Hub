/* eslint-disable max-lines-per-function */
import { type ReactElement } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn, generateGuid } from '@shared/utils';
import { type QuizQuestion, type QuizOption } from './upload-content-types';
import styles from './QuizBuilder.module.css';

export interface QuestionCardProps {
  readonly question: QuizQuestion;
  readonly qIndex: number;
  readonly onChange: (q: QuizQuestion) => void;
  readonly onRemove: () => void;
}

const QuestionValidationAlert = ({
  isPromptEmpty,
  hasTooFewOptions,
  hasNoCorrect,
  hasEmptyOptions,
}: {
  readonly isPromptEmpty: boolean;
  readonly hasTooFewOptions: boolean;
  readonly hasNoCorrect: boolean;
  readonly hasEmptyOptions: boolean;
}): ReactElement | null => {
  if (!isPromptEmpty && !hasTooFewOptions && !hasNoCorrect && !hasEmptyOptions) {
    return null;
  }
  return (
    <div className={styles.questionValidationAlert}>
      <AlertCircle size={15} className={styles.alertIcon} />
      <div className={styles.validationMessages}>
        {isPromptEmpty && <span>Prompt is required.</span>}
        {hasTooFewOptions && <span>Requires at least 2 options.</span>}
        {hasNoCorrect && <span>Select at least one correct option.</span>}
        {hasEmptyOptions && <span>Option text cannot be blank.</span>}
      </div>
    </div>
  );
};

interface OptionItemProps {
  readonly option: QuizOption;
  readonly oIndex: number;
  readonly qIndex: number;
  readonly questionId?: string | null | undefined;
  readonly totalOptions: number;
  readonly toggleCorrectOption: (i: number) => void;
  readonly updateOption: (i: number, o: QuizOption) => void;
  readonly removeOption: (i: number) => void;
}

const OptionItem = ({
  option,
  oIndex,
  qIndex,
  questionId,
  totalOptions,
  toggleCorrectOption,
  updateOption,
  removeOption,
}: OptionItemProps): ReactElement => (
  <div className={cn(styles.optionItem, option.isCorrect && styles.isCorrect)}>
    <input
      type="checkbox"
      name={`q-${questionId ?? String(qIndex)}-correct-${String(oIndex)}`}
      className={styles.optionRadio}
      checked={option.isCorrect}
      onChange={() => {
        toggleCorrectOption(oIndex);
      }}
      aria-label={`Mark option ${String(oIndex + 1)} as correct`}
    />
    <input
      type="text"
      className={cn(styles.optionInput, !option.text.trim() && styles.optionInputEmpty)}
      placeholder={`Option ${String(oIndex + 1)}`}
      value={option.text}
      onChange={(e) => {
        updateOption(oIndex, { ...option, text: e.target.value });
      }}
    />
    {totalOptions > 2 && (
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => {
          removeOption(oIndex);
        }}
        title="Remove Option"
        aria-label="Remove Option"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    )}
  </div>
);

const QuestionPromptHeader = ({
  prompt,
  qIndex,
  isPromptEmpty,
  dragHandleProps,
  onChange,
  onRemove,
}: {
  readonly prompt: string;
  readonly qIndex: number;
  readonly isPromptEmpty: boolean;
  readonly dragHandleProps: {
    readonly attributes: ReturnType<typeof useSortable>['attributes'];
    readonly listeners: ReturnType<typeof useSortable>['listeners'];
  };
  readonly onChange: (prompt: string) => void;
  readonly onRemove: () => void;
}): ReactElement => (
  <div className={styles.questionHeader}>
    <div
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
      className={styles.dragHandle}
      title="Drag to reorder"
      aria-label={`Drag question ${String(qIndex + 1)} to reorder`}
    >
      <GripVertical size={16} />
    </div>
    <span className={styles.questionBadge}>Q{qIndex + 1}</span>
    <input
      type="text"
      className={cn(styles.questionPromptInput, isPromptEmpty && styles.optionInputEmpty)}
      placeholder={`Question ${String(qIndex + 1)} prompt...`}
      value={prompt}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    />
    <Button
      variant="ghost"
      size="icon-sm"
      className={styles.removeBtn}
      onClick={onRemove}
      title="Remove Question"
    >
      <Trash2 aria-hidden="true" />
    </Button>
  </div>
);

export const QuestionCard = ({
  question,
  qIndex,
  onChange,
  onRemove,
}: QuestionCardProps): ReactElement => {
  const sortableId = question.id ?? `q-${String(qIndex)}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: sortableId,
      data: { type: 'Question', question },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
    position: isDragging ? ('relative' as const) : undefined,
  };

  const isPromptEmpty = !question.prompt.trim();
  const hasTooFewOptions = question.options.length < 2;
  const hasNoCorrect = !question.options.some((o) => o.isCorrect);
  const hasEmptyOptions = question.options.some((o) => !o.text.trim());

  const setPrompt = (prompt: string): void => {
    onChange({ ...question, prompt });
  };

  const addOption = (): void => {
    onChange({
      ...question,
      options: [...question.options, { id: generateGuid(), text: '', isCorrect: false }],
    });
  };

  const updateOption = (oIndex: number, newOption: QuizOption): void => {
    const newOptions = [...question.options];
    newOptions[oIndex] = newOption;
    onChange({ ...question, options: newOptions });
  };

  const removeOption = (oIndex: number): void => {
    const newOptions = [...question.options];
    newOptions.splice(oIndex, 1);
    onChange({ ...question, options: newOptions });
  };

  const toggleCorrectOption = (oIndex: number): void => {
    const newOptions = question.options.map((opt, i) =>
      i === oIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt,
    );
    onChange({ ...question, options: newOptions });
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.questionCard}>
      <QuestionPromptHeader
        prompt={question.prompt}
        qIndex={qIndex}
        isPromptEmpty={isPromptEmpty}
        dragHandleProps={{ attributes, listeners }}
        onChange={setPrompt}
        onRemove={onRemove}
      />

      <QuestionValidationAlert
        isPromptEmpty={isPromptEmpty}
        hasTooFewOptions={hasTooFewOptions}
        hasNoCorrect={hasNoCorrect}
        hasEmptyOptions={hasEmptyOptions}
      />

      <div className={styles.optionsList}>
        {question.options.map((option, oIndex) => (
          <OptionItem
            key={option.id ?? `opt-${String(oIndex)}`}
            option={option}
            oIndex={oIndex}
            qIndex={qIndex}
            questionId={question.id ?? undefined}
            totalOptions={question.options.length}
            toggleCorrectOption={toggleCorrectOption}
            updateOption={updateOption}
            removeOption={removeOption}
          />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className={styles.addOptionBtn}
          onClick={addOption}
        >
          <Plus aria-hidden="true" /> Add Option
        </Button>
      </div>
    </div>
  );
};
