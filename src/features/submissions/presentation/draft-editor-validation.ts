import {
  LESSON_KIND,
  MEDIA_SLOT,
  type ContentDraftStateInput,
  type QuizDraftInput,
  type UpdateContentDetailsInput,
  type UpdateCurriculumInput,
} from '@features/content';
import { isValidHttpUrl } from '@shared/utils';
import { FIELD_LIMITS } from './upload-details';

export const validateDetailsLimits = (
  details: UpdateContentDetailsInput,
): string | null => {
  const title = details.title.trim();
  if (!title) {
    return 'Title is required.';
  }
  if (title.length > FIELD_LIMITS.TITLE_MAX) {
    return 'Title must not exceed 200 characters.';
  }
  const description = details.description?.trim();
  if (!description) {
    return 'Description is required.';
  }
  if (description.length > FIELD_LIMITS.DESCRIPTION_MAX) {
    return 'Description must not exceed 4000 characters.';
  }
  return details.categoryId ? null : 'Category is required.';
};

export const validateOptionalDetailsLimits = (
  details: UpdateContentDetailsInput,
): string | null => {
  if (details.subtitle && details.subtitle.length > FIELD_LIMITS.SUBTITLE_MAX) {
    return 'Subtitle must not exceed 300 characters.';
  }
  if (details.topic && details.topic.length > FIELD_LIMITS.TOPIC_MAX) {
    return 'Topic must not exceed 200 characters.';
  }
  if (details.language && details.language.length > FIELD_LIMITS.LANGUAGE_MAX) {
    return 'Language must not exceed 50 characters.';
  }
  if (details.keywords && details.keywords.length > FIELD_LIMITS.KEYWORDS_MAX) {
    return 'Keywords must not exceed 1000 characters.';
  }
  if (
    details.thumbnailAlt &&
    details.thumbnailAlt.length > FIELD_LIMITS.THUMBNAIL_ALT_MAX
  ) {
    return 'Thumbnail Alt text must not exceed 300 characters.';
  }
  return null;
};

export const validateQuizLimits = (quiz?: QuizDraftInput | null): string | null => {
  if (!quiz) return null;
  if (quiz.title && quiz.title.length > FIELD_LIMITS.QUIZ_TITLE_MAX) {
    return `Quiz title must not exceed ${String(FIELD_LIMITS.QUIZ_TITLE_MAX)} characters.`;
  }
  for (const [index, q] of quiz.questions.entries()) {
    if (!q.prompt.trim()) {
      return `Quiz question ${String(index + 1)} prompt is required.`;
    }
  }
  return null;
};

export const validateLessonLimits = (lesson: {
  readonly title: string;
  readonly kind?: number;
  readonly externalUrl?: string | null;
  readonly quiz?: QuizDraftInput | null;
}): string | null => {
  if (!lesson.title.trim() || lesson.title.length > FIELD_LIMITS.LESSON_MAX) {
    return 'Each lesson must have a title up to 300 characters.';
  }
  if (lesson.externalUrl && lesson.externalUrl.length > FIELD_LIMITS.EXTERNAL_URL_MAX) {
    return 'Lesson external URL must not exceed 1000 characters.';
  }
  if (lesson.externalUrl && !isValidHttpUrl(lesson.externalUrl)) {
    return 'Lesson external URL must be a valid HTTP or HTTPS URL.';
  }
  if (lesson.kind === LESSON_KIND.link && !isValidHttpUrl(lesson.externalUrl)) {
    return 'Link lesson requires a valid external URL.';
  }
  return validateQuizLimits(lesson.quiz);
};

export const validateCurriculumLimits = (
  curriculum?: UpdateCurriculumInput,
): string | null => {
  for (const section of curriculum?.sections ?? []) {
    if (!section.title.trim() || section.title.length > FIELD_LIMITS.SECTION_MAX) {
      return 'Each section must have a title up to 200 characters.';
    }
    for (const lesson of section.lessons) {
      const lessonError = validateLessonLimits(lesson);
      if (lessonError) return lessonError;
    }
  }
  return null;
};

const THUMBNAIL_LABEL_BY_TYPE: Readonly<
  Record<'course' | 'tutorial' | 'resource', string>
> = { course: 'Course', tutorial: 'Tutorial', resource: 'Resource' };

export const validateDraftForSubmit = (
  draft: ContentDraftStateInput,
  contentTypeKey: 'course' | 'tutorial' | 'resource',
): string | null => {
  const detailsError =
    validateDetailsLimits(draft.details) ?? validateOptionalDetailsLimits(draft.details);
  if (detailsError) return detailsError;

  const hasThumbnail =
    Boolean(draft.details.thumbnailMediaAssetId) ||
    Boolean(
      draft.media?.some(
        (m) =>
          m.slot === MEDIA_SLOT.thumbnail && (Boolean(m.azureBlobName) || Boolean(m.id)),
      ),
    );
  if (!hasThumbnail) {
    return `${THUMBNAIL_LABEL_BY_TYPE[contentTypeKey]} thumbnail is required before submitting for review.`;
  }

  for (const tag of draft.tags) {
    if (tag.length > FIELD_LIMITS.TAG_MAX) {
      return `Tag "${tag}" exceeds the maximum 80 characters.`;
    }
  }

  const quizError = validateQuizLimits(draft.quiz);
  if (quizError) return quizError;

  return validateCurriculumLimits(draft.curriculum);
};
