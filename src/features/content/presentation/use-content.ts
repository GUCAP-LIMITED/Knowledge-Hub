import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  CONTENT_DIFFICULTY,
  CONTENT_TYPE,
  CONTENT_VISIBILITY,
  type BranchOption,
  type CategoryInput,
  type ContentCategory,
  type ContentDetail,
  type ContentGateway,
  type ContentSummary,
  LESSON_KIND,
  MEDIA_KIND,
  MEDIA_SLOT,
} from '../domain';
import { useContentModule } from './use-content-module';

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
};

/** The wizard's collected state, in its own vocabulary — mapped to the API by the orchestrator. */
export interface UploadWizardInput {
  readonly contentType: 'course' | 'tutorial' | 'resource';
  readonly details: {
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly categoryId: string;
    readonly restrictToBranch: boolean;
    readonly branchId: string;
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
    readonly lessons: readonly { readonly title: string; readonly kind: string }[];
  }[];
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
const parseDuration = (value: string): number => {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
};
const lookup = (
  map: Readonly<Record<string, number>>,
  key: string,
  fallback: number,
): number => map[key] ?? fallback;

/** Upload every slot's files; returns the id of the thumbnail media asset (if any). */
const uploadMedia = async (
  gateway: ContentGateway,
  id: string,
  files: Readonly<Record<string, readonly File[]>>,
): Promise<string | null> => {
  let thumbnailId: string | null = null;
  for (const [slotId, slotFiles] of Object.entries(files)) {
    const slot = SLOT_BY_ID[slotId];
    if (slot === undefined) continue;
    for (const file of slotFiles) {
      const ticket = await gateway.requestUpload(
        id,
        file.name,
        file.type === '' ? null : file.type,
      );
      await gateway.uploadToBlob(ticket, file);
      const media = await gateway.addMedia(id, {
        slot,
        kind: kindFor(file),
        originalFileName: file.name,
        mimeType: file.type === '' ? null : file.type,
        sizeBytes: file.size,
        azureBlobName: ticket.blobName,
        externalUrl: null,
      });
      if (slotId === 'thumbnail' && thumbnailId === null) thumbnailId = media.id;
    }
  }
  return thumbnailId;
};

const buildCurriculum = async (
  gateway: ContentGateway,
  id: string,
  sections: UploadWizardInput['sections'],
): Promise<void> => {
  for (const section of sections) {
    const { id: sectionId } = await gateway.addSection(id, section.title);
    for (const lesson of section.lessons) {
      await gateway.addLesson(id, sectionId, {
        title: lesson.title,
        kind: lookup(LESSON_KIND, lesson.kind, LESSON_KIND.video),
        mediaAssetId: null,
        externalUrl: null,
        durationSeconds: 0,
        isPreview: false,
      });
    }
  }
};

/** Orchestrates create → media → details → curriculum → submit against the content API. */
const runUpload = async (
  gateway: ContentGateway,
  input: UploadWizardInput,
): Promise<ContentDetail> => {
  const created = await gateway.create({
    type: lookup(CONTENT_TYPE, input.contentType, CONTENT_TYPE.course),
    title: input.details.title,
    restrictToBranch: input.details.restrictToBranch,
    branchId: emptyToNull(input.details.branchId),
  });
  const id = created.id;
  const thumbnailId = await uploadMedia(gateway, id, input.files);

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
    keywords: emptyToNull(input.details.keywords),
    thumbnailMediaAssetId: thumbnailId,
    thumbnailAlt: emptyToNull(input.details.thumbnailAlt),
    tags: splitTags(input.details.tags),
  });

  if (input.contentType === 'course') {
    await buildCurriculum(gateway, id, input.sections);
  }

  return gateway.submit(id);
};

/** The full upload → publish flow used by the Upload wizard. */
export const useUploadContent = (): UseMutationResult<
  ContentDetail,
  Error,
  UploadWizardInput
> => {
  const { gateway } = useContentModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadWizardInput): Promise<ContentDetail> =>
      runUpload(gateway, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
};

/** The categories for one content type (course/tutorial/resource) — drives the type-scoped dropdown. */
export const useContentCategories = (
  kind: CategoryKind,
): UseQueryResult<readonly ContentCategory[]> => {
  const { gateway } = useContentModule();
  const type = CONTENT_TYPE[kind];
  return useQuery({
    queryKey: contentKeys.categories(type),
    queryFn: () => gateway.categories(type),
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
  status?: number;
  type?: number;
}): UseQueryResult<readonly ContentSummary[]> => {
  const { gateway } = useContentModule();
  return useQuery({
    queryKey: [...contentKeys.all, params.status ?? null, params.type ?? null],
    queryFn: () => gateway.list(params),
  });
};
