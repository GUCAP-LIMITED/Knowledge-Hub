/* eslint-disable max-lines, complexity */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import { parseDuration, runWithConcurrencyLimit } from '@shared/utils';
import {
  CONTENT_DIFFICULTY,
  CONTENT_STATUS,
  CONTENT_TYPE,
  CONTENT_VISIBILITY,
  type BranchOption,
  type CategoryInput,
  type ContentCategory,
  type ContentDetail,
  type ContentGateway,
  type ContentListPage,
  type MediaUploadTicket,
  LESSON_KIND,
  MEDIA_KIND,
  MEDIA_SLOT,
  type UpdateContentDetailsInput,
  type UpdateCurriculumInput,
  type ContentDraftStateInput,
  type ContentRevision,
  type QuizDraftInput,
  type ReviewQueueParams,
  type RevisionStatusCounts,
  type UserScopeData,
} from '../domain';
import {
  getCachedUserScope,
  setCachedUserScope,
} from '../infrastructure/user-scope-cache';
import { isErr } from '@core/result';
import { startUploadJob } from './upload-job-runner';
import { throwIfCancelled, type UploadRunContext } from './upload-run-context';
import { useContentModule } from './use-content-module';
import { measureVideoDuration } from '@features/tutorials';

/** course/tutorial/resource — the keys of the backend content-type map. */
export type CategoryKind = keyof typeof CONTENT_TYPE;

export const contentKeys = {
  all: ['content'] as const,
  categoriesAll: ['content', 'categories'] as const,
  categories: (type: number): readonly string[] => [
    'content',
    'categories',
    String(type),
  ],
  pendingRevisions: ['content', 'pending-revisions'] as const,
  userScopeData: ['content', 'user-scope-data'] as const,
};

export interface ExternalVideoUrlInput {
  readonly url: string;
  readonly name: string;
  readonly displayOrder: number;
}

/** The wizard's collected state, in its own vocabulary — mapped to the API by the orchestrator. */
export interface UploadWizardInput {
  readonly contentType: 'course' | 'tutorial' | 'resource';
  readonly externalVideoUrls?: readonly ExternalVideoUrlInput[] | undefined;
  readonly details: {
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly categoryId: string;
    readonly branchIds: readonly string[];
    readonly teamIds: readonly string[];
    readonly topic: string;
    readonly difficulty: string;
    readonly language: string;
    readonly duration: string;
    readonly visibility: string;
    readonly keywords: string;
    readonly tags: string;
    readonly thumbnailAlt: string;
  };
  readonly files: Readonly<Record<string, readonly File[]>>;
  readonly sections: readonly {
    readonly title: string;
    readonly displayOrder?: number | undefined;
    readonly lessons: readonly {
      readonly title: string;
      readonly kind: string;
      readonly displayOrder?: number | undefined;
      readonly file?: File | undefined;
      readonly assignmentLocalFiles?: readonly File[] | undefined;
      readonly externalUrl?: string | undefined;
      readonly quiz?:
        | {
            readonly title: string;
            readonly passingPercentage?: number | undefined;
            readonly isMultipleAttemptAllowed?: boolean | undefined;
            readonly questions: readonly {
              readonly prompt: string;
              readonly options: readonly {
                readonly text: string;
                readonly isCorrect: boolean;
              }[];
            }[];
          }
        | undefined;
    }[];
  }[];
  readonly quiz?:
    | {
        readonly title: string;
        readonly isRequired?: boolean | undefined;
        readonly passingPercentage?: number | undefined;
        readonly isMultipleAttemptAllowed?: boolean | undefined;
        readonly questions: readonly {
          readonly prompt: string;
          readonly options: readonly {
            readonly text: string;
            readonly isCorrect: boolean;
          }[];
        }[];
      }
    | null
    | undefined;
}

const SLOT_BY_ID: Readonly<Record<string, number>> = {
  thumbnail: MEDIA_SLOT.thumbnail,
  intro: MEDIA_SLOT.intro,
  lessons: MEDIA_SLOT.lesson,
  resources: MEDIA_SLOT.attachment,
  primary: MEDIA_SLOT.primary,
  files: MEDIA_SLOT.resourceFile,
};

const kindFor = (file: File): number => {
  if (file.type.startsWith('image/')) return MEDIA_KIND.image;
  if (file.type.startsWith('video/')) return MEDIA_KIND.video;
  return MEDIA_KIND.document;
};

const emptyToNull = (value: string): string | null =>
  value.trim() === '' ? null : value.trim();
const splitTags = (value: string): readonly string[] =>
  value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
const lookup = (
  map: Readonly<Record<string, number>>,
  key: string,
  fallback: number,
): number => map[key] ?? fallback;

/** Caps how many files upload at once — bounds browser connections/memory and backend load
    when a user drops a large batch, instead of firing every request simultaneously. */
const UPLOAD_CONCURRENCY = 5;

interface SlotFile {
  readonly slotId: string;
  readonly slot: number;
  readonly file: File;
  readonly displayOrder?: number;
}

const flattenSlotFiles = (
  files: Readonly<Record<string, readonly File[]>>,
): readonly SlotFile[] => {
  const flattened: SlotFile[] = [];
  for (const [slotId, slotFiles] of Object.entries(files)) {
    const slot = SLOT_BY_ID[slotId];
    if (slot === undefined) continue;
    slotFiles.forEach((file, index) => {
      flattened.push({ slotId, slot, file, displayOrder: index });
    });
  }
  return flattened;
};

interface UploadedSlotFile {
  readonly item: SlotFile;
  readonly ticket: MediaUploadTicket;
}

/** Upload every slot's files (bounded-parallel); returns the thumbnail media asset id, if any. */
const uploadMedia = async (
  gateway: ContentGateway,
  id: string,
  files: Readonly<Record<string, readonly File[]>>,
  context: UploadRunContext,
): Promise<string | null> => {
  // Phase 1: request a ticket and PUT the bytes to blob storage — independent per file, so this
  // runs bounded-parallel. Phase 2 (below) registers each upload against the content record one
  // at a time: addMedia mutates that shared record under optimistic concurrency, so racing calls
  // for the same content id 409 ("changed by another user") — parallelizing it isn't safe.
  const uploaded: UploadedSlotFile[] = [];
  await runWithConcurrencyLimit(
    flattenSlotFiles(files),
    UPLOAD_CONCURRENCY,
    async (item) => {
      throwIfCancelled(context.signal);
      const ticket = await gateway.requestUpload(
        id,
        item.file.name,
        item.file.type === '' ? null : item.file.type,
      );
      await gateway.uploadToBlob(ticket, item.file, context.signal);
      uploaded.push({ item, ticket });
    },
  );

  uploaded.sort((a, b) => {
    if (a.item.slot !== b.item.slot) {
      return a.item.slot - b.item.slot;
    }
    return (a.item.displayOrder ?? 0) - (b.item.displayOrder ?? 0);
  });

  let thumbnailId: string | null = null;
  for (const { item, ticket } of uploaded) {
    throwIfCancelled(context.signal);
    const kind = kindFor(item.file);
    let durationSeconds = 0;
    if (kind === MEDIA_KIND.video || item.file.type.startsWith('video/')) {
      durationSeconds = await measureVideoDuration(item.file);
    }
    const media = await gateway.addMedia(id, {
      slot: item.slot,
      kind,
      originalFileName: item.file.name,
      mimeType: item.file.type === '' ? null : item.file.type,
      sizeBytes: item.file.size,
      azureBlobName: ticket.blobName,
      externalUrl: null,
      displayOrder: item.displayOrder,
      durationSeconds,
    });
    if (item.slotId === 'thumbnail' && thumbnailId === null) thumbnailId = media.id;
    context.onFileDone();
  }

  return thumbnailId;
};

const uploadLessonMedia = async (
  gateway: ContentGateway,
  id: string,
  file: File,
  context: UploadRunContext,
): Promise<string> => {
  const ticket = await gateway.requestUpload(
    id,
    file.name,
    file.type === '' ? null : file.type,
  );
  await gateway.uploadToBlob(ticket, file, context.signal);
  const kind = kindFor(file);
  let durationSeconds = 0;
  if (kind === MEDIA_KIND.video || file.type.startsWith('video/')) {
    durationSeconds = await measureVideoDuration(file);
  }
  const media = await gateway.addMedia(id, {
    slot: MEDIA_SLOT.lesson,
    kind,
    originalFileName: file.name,
    mimeType: file.type === '' ? null : file.type,
    sizeBytes: file.size,
    azureBlobName: ticket.blobName,
    externalUrl: null,
    durationSeconds,
  });
  context.onFileDone();
  return media.id;
};

interface BuildLessonContext {
  readonly contentId: string;
  readonly sectionId: string;
  /** The upload job's cancel signal and progress callbacks. */
  readonly run: UploadRunContext;
}

const buildLesson = async (
  gateway: ContentGateway,
  context: BuildLessonContext,
  lesson: UploadWizardInput['sections'][number]['lessons'][number],
): Promise<void> => {
  const { contentId, sectionId, run } = context;
  throwIfCancelled(run.signal);
  let mediaAssetId: string | null = null;
  if (lesson.file) {
    mediaAssetId = await uploadLessonMedia(gateway, contentId, lesson.file, run);
  }

  let quizId: string | null = null;
  if (lesson.kind === 'quiz' && lesson.quiz) {
    const createdQuiz = await gateway.createQuiz({
      title: lesson.title || lesson.quiz.title,
      passingPercentage: lesson.quiz.passingPercentage ?? 80,
      isMultipleAttemptAllowed: lesson.quiz.isMultipleAttemptAllowed ?? true,
      questions: lesson.quiz.questions.map((q) => ({
        prompt: q.prompt,
        options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      })),
    });
    quizId = createdQuiz.id;
  }

  const createdLesson = await gateway.addLesson(contentId, sectionId, {
    title: lesson.title,
    kind: lookup(LESSON_KIND, lesson.kind, LESSON_KIND.video),
    displayOrder: lesson.displayOrder,
    mediaAssetId,
    externalUrl: lesson.externalUrl ?? null,
    quizId,
    durationSeconds: 0,
    isPreview: false,
  });

  if (
    lesson.kind === 'assignment' &&
    lesson.assignmentLocalFiles &&
    lesson.assignmentLocalFiles.length > 0
  ) {
    for (const briefFile of lesson.assignmentLocalFiles) {
      throwIfCancelled(run.signal);
      const ticket = await gateway.requestUpload(
        contentId,
        briefFile.name,
        briefFile.type === '' ? null : briefFile.type,
      );
      await gateway.uploadToBlob(ticket, briefFile, run.signal);
      await gateway.addMedia(contentId, {
        slot: MEDIA_SLOT.courseAssignmentBrief,
        kind: kindFor(briefFile),
        originalFileName: briefFile.name,
        mimeType: briefFile.type === '' ? null : briefFile.type,
        sizeBytes: briefFile.size,
        azureBlobName: ticket.blobName,
        externalUrl: null,
        referencedLessonId: createdLesson.id,
      });
      run.onFileDone();
    }
  }
};

const buildCurriculum = async (
  gateway: ContentGateway,
  id: string,
  sections: UploadWizardInput['sections'],
  run: UploadRunContext,
): Promise<void> => {
  for (const section of sections) {
    const { id: sectionId } = await gateway.addSection(
      id,
      section.title,
      section.displayOrder,
    );
    const context: BuildLessonContext = { contentId: id, sectionId, run };
    for (const lesson of section.lessons) {
      await buildLesson(gateway, context, lesson);
    }
  }
};

/** Total files this submission will upload — slot files plus any lesson files (course only). */
const countFiles = (input: UploadWizardInput): number => {
  const slotCount = flattenSlotFiles(input.files).length;
  const externalCount = input.externalVideoUrls?.length ?? 0;
  const lessonCount = input.sections
    .flatMap((section) => section.lessons)
    .reduce((acc, lesson) => {
      const singleFile = lesson.file !== undefined ? 1 : 0;
      const assignmentCount = lesson.assignmentLocalFiles?.length ?? 0;
      return acc + singleFile + assignmentCount;
    }, 0);
  return slotCount + externalCount + lessonCount;
};

const createTutorialQuiz = async (
  gateway: ContentGateway,
  input: UploadWizardInput,
): Promise<string | null> => {
  if (
    input.contentType !== 'tutorial' ||
    !input.quiz ||
    input.quiz.questions.length === 0
  ) {
    return null;
  }
  const createdQuiz = await gateway.createQuiz({
    title: input.quiz.title || input.details.title,
    passingPercentage: input.quiz.passingPercentage ?? 80,
    isMultipleAttemptAllowed: input.quiz.isMultipleAttemptAllowed ?? true,
    questions: input.quiz.questions.map((q) => ({
      prompt: q.prompt,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    })),
  });
  return createdQuiz.id;
};

/** Orchestrates create → media → details → curriculum → submit against the content API. */
const runUpload = async (
  gateway: ContentGateway,
  input: UploadWizardInput,
  context: UploadRunContext,
): Promise<ContentDetail> => {
  throwIfCancelled(context.signal);
  const created = await gateway.create({
    type: lookup(CONTENT_TYPE, input.contentType, CONTENT_TYPE.course),
    title: input.details.title,
    branchIds: input.details.branchIds,
  });
  const id = created.id;
  context.onContentCreated(id);
  const thumbnailId = await uploadMedia(gateway, id, input.files, context);
  throwIfCancelled(context.signal);
  if (input.externalVideoUrls && input.externalVideoUrls.length > 0) {
    for (const ext of input.externalVideoUrls) {
      throwIfCancelled(context.signal);
      await gateway.addMedia(id, {
        slot: MEDIA_SLOT.primary,
        kind: MEDIA_KIND.video,
        originalFileName: ext.name,
        mimeType: null,
        sizeBytes: 0,
        azureBlobName: null,
        externalUrl: ext.url,
        displayOrder: ext.displayOrder,
      });
      context.onFileDone();
    }
  }
  const tutorialQuizId = await createTutorialQuiz(gateway, input);
  const isQuizRequired = tutorialQuizId !== null && (input.quiz?.isRequired ?? true);

  await gateway.updateDetails(id, {
    title: input.details.title,
    subtitle: emptyToNull(input.details.subtitle),
    description: emptyToNull(input.details.description),
    categoryId: emptyToNull(input.details.categoryId),
    topic: emptyToNull(input.details.topic),
    difficulty: lookup(
      CONTENT_DIFFICULTY,
      input.details.difficulty,
      CONTENT_DIFFICULTY.Beginner,
    ),
    language: emptyToNull(input.details.language),
    durationSeconds: parseDuration(input.details.duration),
    visibility: lookup(
      CONTENT_VISIBILITY,
      input.details.visibility,
      CONTENT_VISIBILITY.team,
    ),
    branchIds: input.details.branchIds,
    teamIds: input.details.teamIds.length > 0 ? input.details.teamIds : null,
    keywords: emptyToNull(input.details.keywords),
    thumbnailMediaAssetId: thumbnailId,
    thumbnailAlt: emptyToNull(input.details.thumbnailAlt),
    quizId: tutorialQuizId,
    isQuizRequired,
    tags: splitTags(input.details.tags),
  });

  if (input.contentType === 'course') {
    await buildCurriculum(gateway, id, input.sections, context);
  }

  throwIfCancelled(context.signal);
  return gateway.submit(id);
};

/**
 * The full upload → publish flow used by the Upload wizard. Registers a job in the global
 * `useUploadQueueStore` so the floating `UploadProgressWidget` (mounted once in `AppLayout`) can
 * show progress no matter which route the user navigates to before the upload finishes.
 */
export const useUploadContent = (): UseMutationResult<
  ContentDetail,
  Error,
  UploadWizardInput
> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadWizardInput): Promise<ContentDetail> => {
      const result = await startUploadJob(
        {
          gateway,
          run: (wizardInput, context) => runUpload(gateway, wizardInput, context),
          onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: contentKeys.all });
          },
        },
        input,
        input.details.title.trim() || 'Untitled upload',
        countFiles(input),
      );
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export interface UseContentCategoriesOptions {
  readonly enabled?: boolean;
  readonly staleTime?: number;
  readonly gcTime?: number;
  readonly refetchOnMount?: boolean | 'always';
}

/** The categories for one content type (course/tutorial/resource) — drives the type-scoped dropdown. */
export const useContentCategories = (
  kind: CategoryKind,
  options?: UseContentCategoriesOptions,
): UseQueryResult<readonly ContentCategory[]> => {
  const { gateway } = useContentModule();
  const type = CONTENT_TYPE[kind];
  return useQuery({
    queryKey: contentKeys.categories(type),
    queryFn: () => gateway.categories(type),
    ...(options?.enabled !== undefined ? { enabled: options.enabled } : {}),
    ...(options?.staleTime !== undefined ? { staleTime: options.staleTime } : {}),
    ...(options?.gcTime !== undefined ? { gcTime: options.gcTime } : {}),
    ...(options?.refetchOnMount !== undefined
      ? { refetchOnMount: options.refetchOnMount }
      : {}),
  });
};

/** The signed-in user's branches (for the upload branch picker); fetched only when `enabled`. */
export const useMyBranches = (
  enabled: boolean,
): UseQueryResult<readonly BranchOption[]> => {
  const { gateway } = useContentModule();
  return useQuery({
    queryKey: ['content', 'my-branches'],
    queryFn: () => gateway.myBranches(),
    enabled,
  });
};

/** The signed-in user's scope data (accessible branches and teams); cached in localStorage for 5 minutes. */
export const useUserScopeData = (enabled = true): UseQueryResult<UserScopeData> => {
  const { gateway } = useContentModule();
  return useQuery({
    queryKey: contentKeys.userScopeData,
    queryFn: async (): Promise<UserScopeData> => {
      const cached = getCachedUserScope();
      if (cached) return cached;
      const fresh = await gateway.userScopeData();
      setCachedUserScope(fresh);
      return fresh;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
  });
};

const useInvalidateCategories = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: contentKeys.categoriesAll });
  };
};

export const useCreateCategory = (): UseMutationResult<
  ContentCategory,
  Error,
  CategoryInput
> => {
  const { gateway } = useContentModule();
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (input: CategoryInput) => gateway.createCategory(input),
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = (): UseMutationResult<
  ContentCategory,
  Error,
  { readonly id: string; readonly input: CategoryInput }
> => {
  const { gateway } = useContentModule();
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, input }) => gateway.updateCategory(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteCategory = (): UseMutationResult<void, Error, string> => {
  const { gateway } = useContentModule();
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: string) => gateway.deleteCategory(id),
    onSuccess: invalidate,
  });
};

export const useContentList = (params: {
  status?: number | undefined;
  type?: number | undefined;
  filter?: string | undefined;
  skipCount?: number | undefined;
  maxResultCount?: number | undefined;
  enabled?: boolean | undefined;
}): UseQueryResult<ContentListPage> => {
  const { gateway } = useContentModule();
  const { status, type, filter, skipCount, maxResultCount, enabled = true } = params;
  return useQuery({
    queryKey: [
      ...contentKeys.all,
      'list',
      status ?? null,
      type ?? null,
      filter ?? '',
      skipCount ?? 0,
      maxResultCount ?? null,
    ],
    queryFn: () =>
      gateway.list({
        status,
        type,
        filter,
        skipCount,
        maxResultCount,
      }),
    enabled,
  });
};

export const useContentDetail = (
  id: string,
  options?: { readonly enabled?: boolean },
): UseQueryResult<ContentDetail> => {
  const { gateway } = useContentModule();
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: [...contentKeys.all, 'detail', id],
    queryFn: () => gateway.get(id),
    enabled,
  });
};

export const useUpdateDetails = (
  id: string,
): UseMutationResult<ContentDetail, Error, UpdateContentDetailsInput> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => gateway.updateDetails(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...contentKeys.all, 'detail', id],
      });
      void queryClient.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
};

export const useUpdateCurriculum = (
  id: string,
): UseMutationResult<ContentDetail, Error, UpdateCurriculumInput> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => gateway.updateCurriculum(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...contentKeys.all, 'detail', id],
      });
    },
  });
};

export const useDeleteContent = (): UseMutationResult<void, Error, string> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await gateway.remove(id);
    },
    onSuccess: () => {
      success('Content deleted successfully.');
      void queryClient.invalidateQueries({ queryKey: contentKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};

export const useGetRevision = (
  revisionId: string,
  options?: { readonly enabled?: boolean },
): UseQueryResult<ContentRevision> => {
  const { gateway } = useContentModule();
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: [...contentKeys.all, 'revision', revisionId],
    queryFn: () => gateway.getRevision(revisionId),
    enabled,
  });
};

export const useGetActiveRevision = (
  id: string,
  options?: { readonly enabled?: boolean },
): UseQueryResult<ContentRevision | null> => {
  const { gateway } = useContentModule();
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: [...contentKeys.all, 'active-revision', id],
    queryFn: () => gateway.getActiveRevision(id),
    enabled,
  });
};

export const useGetReviewQueue = (
  params?: ReviewQueueParams,
): UseQueryResult<{
  items: readonly ContentRevision[];
  totalCount: number;
}> => {
  const { gateway } = useContentModule();
  return useQuery({
    queryKey: [...contentKeys.pendingRevisions, params] as const,
    queryFn: () => gateway.getReviewQueue(params),
  });
};

export const useRevisionStatusCounts = (
  params: Pick<ReviewQueueParams, 'filter' | 'type'>,
): UseQueryResult<RevisionStatusCounts> => {
  const { gateway } = useContentModule();
  return useQuery({
    queryKey: [...contentKeys.pendingRevisions, 'status-counts', params] as const,
    queryFn: () => gateway.getRevisionStatusCounts(params),
    staleTime: 30_000,
  });
};

export const useSaveRevision = (
  id: string,
): UseMutationResult<ContentRevision, Error, ContentDraftStateInput> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: (input) => gateway.saveRevision(id, input),
    onSuccess: () => {
      success('Draft saved successfully.');
      void queryClient.invalidateQueries({
        queryKey: [...contentKeys.all, 'active-revision', id],
      });
    },
  });
};

export const useSubmitRevision = (
  id: string,
): UseMutationResult<ContentRevision, Error, void> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: () => gateway.submitRevision(id),
    onSuccess: (revision) => {
      if (revision.status === CONTENT_STATUS.approved) {
        success('Changes approved and applied live.');
      } else {
        success('Submitted for review.');
      }
      void queryClient.invalidateQueries({
        queryKey: contentKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: ['submissions'],
      });
    },
  });
};

export const useApproveRevision = (
  id: string,
): UseMutationResult<ContentRevision, Error, { readonly notes?: string }> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: ({ notes }) => gateway.approveRevision(id, notes),
    onSuccess: () => {
      success('Revision approved and published.');
      void queryClient.invalidateQueries({
        queryKey: [...contentKeys.all, 'detail', id],
      });
      void queryClient.invalidateQueries({
        queryKey: [...contentKeys.all, 'active-revision', id],
      });
      void queryClient.invalidateQueries({
        queryKey: contentKeys.pendingRevisions,
      });
    },
  });
};

export const useRejectRevision = (
  id: string,
): UseMutationResult<ContentRevision, Error, { readonly reason: string }> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: ({ reason }) => gateway.rejectRevision(id, reason),
    onSuccess: () => {
      success('Revision rejected.');
      void queryClient.invalidateQueries({
        queryKey: [...contentKeys.all, 'active-revision', id],
      });
      void queryClient.invalidateQueries({
        queryKey: contentKeys.pendingRevisions,
      });
    },
  });
};

export const useGetMediaReadSas = (
  contentId: string,
  blobName?: string | null,
): UseQueryResult<string | null> => {
  const { gateway } = useContentModule();
  return useQuery({
    queryKey: [...contentKeys.all, 'media-read-sas', contentId, blobName],
    queryFn: () => gateway.getMediaReadSas(contentId, blobName ?? ''),
    enabled: Boolean(contentId && blobName),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetQuiz = (
  quizId?: string | null,
  options?: {
    readonly enabled?: boolean;
    readonly includeAnswers?: boolean;
  },
): UseQueryResult<QuizDraftInput> => {
  const { gateway } = useContentModule();
  const enabled = (options?.enabled ?? true) && Boolean(quizId);
  const includeAnswers = options?.includeAnswers ?? true;
  return useQuery({
    queryKey: ['quizzes', quizId, includeAnswers],
    queryFn: () => gateway.getQuiz(String(quizId), includeAnswers),
    enabled,
  });
};
