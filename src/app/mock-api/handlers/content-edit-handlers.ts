import { toDetailDto } from '../content-view';
import { nextId, type MockState } from '../mock-state';
import { notFound, patch, requireUser } from '../mock-context';
import type { MockRequest, MockRoute } from '../mock-types';
import type { LessonSeed, SectionSeed } from '../seed/course-seed';
import { uploadedAssetId } from '../seed/media-assets';
import type { MockContentItem } from '../seed/submission-seed';
import { editable } from './content-handlers';

const BASE = '/api/app/content';

interface DetailsInput {
  readonly title: string;
  readonly subtitle: string | null;
  readonly description: string | null;
  readonly categoryId: string | null;
  readonly topic: string | null;
  readonly difficulty: number;
  readonly language: string | null;
  readonly durationSeconds: number;
  readonly visibility: number;
  readonly branchIds?: string[] | null;
  readonly teamIds: string[] | null;
  readonly keywords: string | null;
  readonly quizId?: string | null;
  readonly tags: string[];
}

export const applyDetails = (item: MockContentItem, input: DetailsInput): void => {
  Object.assign(item, {
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    categoryId: input.categoryId,
    topic: input.topic,
    difficulty: input.difficulty,
    language: input.language,
    durationSeconds: input.durationSeconds,
    visibility: input.visibility,
    teamIds: input.teamIds,
    keywords: input.keywords,
    tags: input.tags,
    branchIds: input.branchIds ?? item.branchIds,
    quizId: input.quizId === undefined ? item.quizId : input.quizId,
  });
};

interface MediaBody {
  readonly slot: number;
  readonly kind: number;
  readonly originalFileName: string;
  readonly title?: string | null;
  readonly mimeType: string | null;
  readonly sizeBytes: number;
  readonly referencedLessonId?: string | null;
  readonly displayOrder?: number | null;
  readonly durationSeconds?: number;
}

export const addMedia = (
  state: MockState,
  item: MockContentItem,
  body: MediaBody,
): MockContentItem['media'][number] => {
  const id = uploadedAssetId(body.mimeType, Number(nextId(state, 'n').split('-')[1]));
  const media = {
    id,
    slot: body.slot,
    kind: body.kind,
    originalFileName: body.originalFileName,
    mimeType: body.mimeType,
    sizeBytes: body.sizeBytes,
    url: null,
    referencedLessonId: body.referencedLessonId ?? null,
    displayOrder: body.displayOrder ?? item.media.length,
    durationSeconds: body.durationSeconds ?? 0,
  };
  item.media.push(media);
  return media;
};

interface LessonBody {
  readonly id?: string;
  readonly title: string;
  readonly kind: number;
  readonly mediaAssetId: string | null;
  readonly externalUrl: string | null;
  readonly quizId?: string | null | undefined;
  readonly durationSeconds: number;
  readonly isPreview: boolean;
}

const toLesson = (body: LessonBody, id: string): LessonSeed => ({
  id,
  title: body.title,
  minutes: Math.max(1, Math.round(body.durationSeconds / 60)),
  kind: body.kind as LessonSeed['kind'],
  ...(body.mediaAssetId !== null ? { mediaAssetId: body.mediaAssetId } : {}),
  ...(body.quizId ? { quizId: body.quizId } : {}),
  ...(body.externalUrl !== null ? { externalUrl: body.externalUrl } : {}),
  isPreview: body.isPreview,
});

interface QuizDraft {
  readonly id?: string | null;
  readonly title: string;
  readonly passingPercentage: number;
  readonly isMultipleAttemptAllowed: boolean;
  readonly questions: readonly {
    readonly prompt: string;
    readonly options: readonly {
      readonly text: string;
      readonly isCorrect?: boolean | null;
    }[];
  }[];
}

type LessonDraft = LessonBody & {
  readonly id: string;
  readonly media?: MediaBody | null;
  readonly quiz?: QuizDraft | null;
};

interface CurriculumBody {
  readonly sections: readonly {
    readonly id: string;
    readonly title: string;
    readonly lessons: readonly LessonDraft[];
  }[];
}

const saveQuizDraft = (state: MockState, draft: QuizDraft): string => {
  const id = draft.id ?? nextId(state, 'quiz');
  const quiz = {
    id,
    title: draft.title,
    passingPercentage: draft.passingPercentage,
    isMultipleAttemptAllowed: draft.isMultipleAttemptAllowed,
    version: 1,
    questions: draft.questions.map((q, qi) => ({
      id: `${id}-q${String(qi + 1)}`,
      prompt: q.prompt,
      options: q.options.map((o, oi) => ({
        id: `${id}-q${String(qi + 1)}-o${String(oi + 1)}`,
        text: o.text,
        isCorrect: o.isCorrect === true,
      })),
    })),
  };
  const existing = state.quizzes.findIndex((x) => x.id === id);
  if (existing >= 0) {
    state.quizzes.splice(existing, 1, quiz);
  } else {
    state.quizzes.push(quiz);
  }
  return id;
};

const resolveLesson = (
  state: MockState,
  item: MockContentItem,
  lesson: LessonDraft,
): LessonSeed => {
  const mediaAssetId =
    lesson.media === undefined || lesson.media === null
      ? lesson.mediaAssetId
      : addMedia(state, item, { ...lesson.media, referencedLessonId: lesson.id }).id;
  const quizId =
    lesson.quiz === undefined || lesson.quiz === null
      ? lesson.quizId
      : saveQuizDraft(state, lesson.quiz);
  return toLesson({ ...lesson, mediaAssetId, quizId }, lesson.id);
};

/** Replaces the curriculum, registering any media / quiz drafts the lessons carry. */
export const applyCurriculum = (
  state: MockState,
  item: MockContentItem,
  body: CurriculumBody,
): void => {
  patch(item, {
    sections: body.sections.map(
      (s): SectionSeed => ({
        id: s.id,
        title: s.title,
        lessons: s.lessons.map((lesson) => resolveLesson(state, item, lesson)),
      }),
    ),
  });
};

const findSection = (item: MockContentItem, id: string): SectionSeed => {
  const section = item.sections.find((s) => s.id === id);
  if (section === undefined) {
    throw notFound('Section');
  }
  return section;
};

const edit = (state: MockState, request: MockRequest): MockContentItem =>
  editable(state, request.params.id ?? '');

export const contentEditHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'PUT',
    pattern: `${BASE}/:id/details`,
    handler: (request) => {
      const item = edit(state, request);
      applyDetails(item, request.body as DetailsInput);
      return toDetailDto(state, requireUser(request), item);
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/media`,
    handler: (request) =>
      addMedia(state, edit(state, request), request.body as MediaBody),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/section`,
    handler: (request) => {
      const item = edit(state, request);
      const section: SectionSeed = {
        id: nextId(state, 'section'),
        title: (request.body as { title: string }).title,
        lessons: [],
      };
      item.sections.push(section);
      return { id: section.id };
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/lesson/:sectionId`,
    handler: (request) => {
      const item = edit(state, request);
      const section = findSection(item, request.params.sectionId ?? '');
      const lesson = toLesson(request.body as LessonBody, nextId(state, 'lesson'));
      item.sections = item.sections.map((sec) =>
        sec.id === section.id ? { ...sec, lessons: [...sec.lessons, lesson] } : sec,
      );
      return { id: lesson.id };
    },
  },
  {
    method: 'PUT',
    pattern: `${BASE}/:id/curriculum`,
    handler: (request) => {
      const item = edit(state, request);
      applyCurriculum(state, item, request.body as CurriculumBody);
      return toDetailDto(state, requireUser(request), item);
    },
  },
];
