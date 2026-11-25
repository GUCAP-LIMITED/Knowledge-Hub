import { generateGuid, isValidGuid } from '@shared/utils';
import type {
  QuizDraftInput,
  QuizOptionDraftInput,
  QuizQuestionDraftInput,
  UpdateCurriculumInput,
  UpdateCurriculumLessonInput,
  UpdateCurriculumSectionInput,
} from '@features/content';

const sanitizeOption = (option: QuizOptionDraftInput): QuizOptionDraftInput => ({
  id: option.id && isValidGuid(option.id) ? option.id : generateGuid(),
  text: option.text,
  isCorrect: option.isCorrect,
});

const sanitizeQuestion = (question: QuizQuestionDraftInput): QuizQuestionDraftInput => ({
  id: question.id && isValidGuid(question.id) ? question.id : generateGuid(),
  prompt: question.prompt,
  displayOrder: question.displayOrder,
  options: question.options.map(sanitizeOption),
});

export const sanitizeQuiz = (
  quiz: QuizDraftInput | null | undefined,
): QuizDraftInput | null => {
  if (!quiz) {
    return null;
  }
  return {
    id: quiz.id && isValidGuid(quiz.id) ? quiz.id : null,
    title: quiz.title,
    isRequired: quiz.isRequired,
    passingPercentage: quiz.passingPercentage ?? 80,
    isMultipleAttemptAllowed: quiz.isMultipleAttemptAllowed ?? true,
    upgradeQuiz: quiz.upgradeQuiz ?? true,
    version: quiz.version,
    questions: quiz.questions.map(sanitizeQuestion),
  };
};

const sanitizeLesson = (
  lesson: UpdateCurriculumLessonInput,
): UpdateCurriculumLessonInput => ({
  id: isValidGuid(lesson.id) ? lesson.id : generateGuid(),
  title: lesson.title,
  kind: lesson.kind,
  displayOrder: lesson.displayOrder,
  mediaAssetId: lesson.mediaAssetId,
  externalUrl: lesson.externalUrl,
  quizId: lesson.quizId ?? null,
  durationSeconds: lesson.durationSeconds,
  isPreview: lesson.isPreview,
  media: lesson.media ?? null,
  quiz: sanitizeQuiz(lesson.quiz),
  assignmentFiles: lesson.assignmentFiles ?? null,
});

const sanitizeSection = (
  section: UpdateCurriculumSectionInput,
): UpdateCurriculumSectionInput => ({
  id: isValidGuid(section.id) ? section.id : generateGuid(),
  title: section.title,
  displayOrder: section.displayOrder,
  lessons: section.lessons.map(sanitizeLesson),
});

export const sanitizeCurriculum = (
  curriculum: UpdateCurriculumInput | undefined,
): UpdateCurriculumInput | undefined => {
  if (!curriculum) {
    return undefined;
  }
  return {
    sections: curriculum.sections.map(sanitizeSection),
  };
};
