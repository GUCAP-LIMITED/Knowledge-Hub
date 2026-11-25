import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { generateGuid } from '@shared/utils';
import { type Lesson, type QuizConfig, type QuizQuestion } from './upload-content-types';

export interface QuizBuilderProps {
  readonly lesson?: Lesson;
  readonly updateLesson?: (lesson: Lesson) => void;
  readonly quiz?: QuizConfig;
  readonly onChange?: (quiz: QuizConfig) => void;
}

export const resolveQuiz = (directQuiz?: QuizConfig, lesson?: Lesson): QuizConfig => {
  if (directQuiz) {
    return directQuiz;
  }
  if (lesson?.quiz) {
    return lesson.quiz;
  }
  return {
    title: lesson?.title ?? 'Quiz Assessment',
    questions: [],
    passingPercentage: 80,
    isMultipleAttemptAllowed: true,
  };
};

export const canUpgradeQuiz = (quiz: QuizConfig): boolean =>
  (quiz.version !== undefined && quiz.version >= 1) || Boolean(quiz.id);

export const useQuizSensors = (): ReturnType<typeof useSensors> =>
  useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

const reorderQuestions = (
  questions: readonly QuizQuestion[],
  activeId: string,
  overId: string,
): QuizQuestion[] | null => {
  const oldIndex = questions.findIndex(
    (q, idx) => (q.id ?? `q-${String(idx)}`) === activeId,
  );
  const newIndex = questions.findIndex(
    (q, idx) => (q.id ?? `q-${String(idx)}`) === overId,
  );

  if (oldIndex === -1 || newIndex === -1) {
    return null;
  }

  return arrayMove([...questions], oldIndex, newIndex).map((q, index) => ({
    ...q,
    displayOrder: index,
  }));
};

export interface QuizBuilderHookResult {
  readonly quiz: QuizConfig;
  readonly passingPercentage: number;
  readonly isMultipleAttemptAllowed: boolean;
  readonly sensors: ReturnType<typeof useSensors>;
  readonly updateQuiz: (newQuiz: QuizConfig) => void;
  readonly handleDragEnd: (event: DragEndEvent) => void;
  readonly addQuestion: () => void;
  readonly updateQuestion: (qIndex: number, newQuestion: QuizQuestion) => void;
  readonly removeQuestion: (qIndex: number) => void;
}

export const useQuizBuilder = ({
  lesson,
  updateLesson,
  quiz: directQuiz,
  onChange,
}: QuizBuilderProps): QuizBuilderHookResult => {
  const quiz = resolveQuiz(directQuiz, lesson);
  const passingPercentage = quiz.passingPercentage ?? 80;
  const isMultipleAttemptAllowed = quiz.isMultipleAttemptAllowed ?? true;
  const sensors = useQuizSensors();

  const updateQuiz = (newQuiz: QuizConfig): void => {
    if (onChange) {
      onChange(newQuiz);
      return;
    }
    if (lesson && updateLesson) {
      updateLesson({ ...lesson, quiz: newQuiz });
    }
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const reordered = reorderQuestions(
      quiz.questions,
      String(active.id),
      String(over.id),
    );
    if (reordered) {
      updateQuiz({ ...quiz, questions: reordered });
    }
  };

  const addQuestion = (): void => {
    const nextOrder = quiz.questions.length;
    updateQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          id: generateGuid(),
          prompt: '',
          displayOrder: nextOrder,
          options: [
            { id: generateGuid(), text: '', isCorrect: true },
            { id: generateGuid(), text: '', isCorrect: false },
          ],
        },
      ],
    });
  };

  const updateQuestion = (qIndex: number, newQuestion: QuizQuestion): void => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex] = { ...newQuestion, displayOrder: qIndex };
    updateQuiz({ ...quiz, questions: newQuestions });
  };

  const removeQuestion = (qIndex: number): void => {
    const newQuestions = quiz.questions
      .filter((_, idx) => idx !== qIndex)
      .map((q, idx) => ({ ...q, displayOrder: idx }));
    updateQuiz({ ...quiz, questions: newQuestions });
  };

  return {
    quiz,
    passingPercentage,
    isMultipleAttemptAllowed,
    sensors,
    updateQuiz,
    handleDragEnd,
    addQuestion,
    updateQuestion,
    removeQuestion,
  };
};
