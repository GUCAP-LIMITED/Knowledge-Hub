/* eslint-disable max-lines, complexity */
import {
  MEDIA_SLOT,
  type ContentDetail,
  type ContentDraftStateInput,
  type ContentRevision,
  type MediaAsset,
  type MediaDraftInput,
  type QuizDraftInput,
  type UpdateContentDetailsInput,
  type UpdateCurriculumInput,
} from '@features/content';
import { generateGuid, isValidGuid } from '@shared/utils';
import { sortMediaBySavedOrder } from '@features/tutorials';
import { sanitizeCurriculum } from './draft-editor-sanitizer';

export const createLiveMedia = (
  media: readonly MediaAsset[],
  contentId?: string,
): readonly MediaDraftInput[] => {
  const thumbMedia = media.filter((m) => m.slot === MEDIA_SLOT.thumbnail);
  const otherMedia = media.filter((m) => m.slot !== MEDIA_SLOT.thumbnail);
  const sortedOther: readonly MediaAsset[] = contentId
    ? sortMediaBySavedOrder(otherMedia, contentId)
    : otherMedia;

  const mappedOther: MediaDraftInput[] = sortedOther.map((m, index) => ({
    id: m.id,
    azureBlobName: '',
    originalFileName: m.originalFileName,
    title: m.title ?? undefined,
    mimeType: m.mimeType ?? null,
    sizeBytes: m.sizeBytes ?? 0,
    kind: m.kind,
    slot: m.slot,
    displayOrder: index,
    previewUrl: m.url,
    durationSeconds: m.durationSeconds ?? 0,
    externalUrl: m.externalUrl ?? null,
  }));

  const mappedThumb: MediaDraftInput[] = thumbMedia.map((m) => ({
    id: m.id,
    azureBlobName: '',
    originalFileName: m.originalFileName,
    title: m.title ?? undefined,
    mimeType: m.mimeType ?? null,
    sizeBytes: m.sizeBytes ?? 0,
    kind: m.kind,
    slot: m.slot,
    displayOrder: m.displayOrder ?? 0,
    previewUrl: m.url,
    durationSeconds: m.durationSeconds ?? 0,
    externalUrl: m.externalUrl ?? null,
  }));

  return [...mappedThumb, ...mappedOther];
};

type NormalizedDisplayOrder<T> = T extends unknown
  ? Omit<T, 'displayOrder'> & { readonly displayOrder: number }
  : never;

export const normalizeDisplayOrders = <
  T extends { readonly displayOrder?: number | null | undefined },
>(
  items: readonly T[],
): NormalizedDisplayOrder<T>[] => {
  const hasNullish = items.some(
    (item) => item.displayOrder === null || item.displayOrder === undefined,
  );
  const allZeroes = items.length > 1 && items.every((item) => item.displayOrder === 0);

  if (hasNullish || allZeroes) {
    return items.map((item, index) => ({
      ...item,
      displayOrder: index,
    })) as unknown as NormalizedDisplayOrder<T>[];
  }

  return [...items]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((item, index) => ({
      ...item,
      displayOrder: typeof item.displayOrder === 'number' ? item.displayOrder : index,
    })) as unknown as NormalizedDisplayOrder<T>[];
};

export const createLiveCurriculum = (
  content: ContentDetail,
  contentTypeKey: 'course' | 'tutorial' | 'resource',
): UpdateCurriculumInput | undefined => {
  if (contentTypeKey !== 'course') {
    return undefined;
  }
  const orderedSections = normalizeDisplayOrders(content.sections);
  return sanitizeCurriculum({
    sections: orderedSections.map((s) => {
      const orderedLessons = normalizeDisplayOrders(s.lessons);
      return {
        id: isValidGuid(s.id) ? s.id : generateGuid(),
        title: s.title,
        displayOrder: s.displayOrder,
        lessons: orderedLessons.map((l) => {
          const lessonId = isValidGuid(l.id) ? l.id : generateGuid();
          const briefAssets =
            l.attachments && l.attachments.length > 0
              ? content.media.filter((m) =>
                  l.attachments?.some((a) => a.mediaAssetId === m.id && a.role === 10),
                )
              : content.media.filter(
                  (m) =>
                    m.slot === MEDIA_SLOT.courseAssignmentBrief &&
                    m.referencedLessonId === l.id,
                );
          return {
            id: lessonId,
            title: l.title,
            kind: l.kind,
            displayOrder: l.displayOrder,
            mediaAssetId: l.mediaAssetId,
            externalUrl: l.externalUrl,
            quizId: l.quizId,
            durationSeconds: l.durationSeconds,
            isPreview: l.isPreview,
            assignmentFiles: briefAssets.length > 0 ? createLiveMedia(briefAssets) : null,
          };
        }),
      };
    }),
  });
};

const resolveLiveThumbnailId = (content: ContentDetail): string | null =>
  content.thumbnailMediaAssetId ??
  content.media.find((m) => m.slot === MEDIA_SLOT.thumbnail)?.id ??
  null;

const createLiveDetails = (content: ContentDetail): UpdateContentDetailsInput => ({
  title: content.title,
  subtitle: content.subtitle,
  description: content.description,
  categoryId: content.categoryId,
  topic: content.topic,
  difficulty: content.difficulty,
  language: content.language,
  durationSeconds: content.durationSeconds,
  visibility: content.visibility,
  branchIds: content.branchIds,
  teamIds: content.teamIds,
  keywords: content.keywords,
  thumbnailMediaAssetId: resolveLiveThumbnailId(content),
  thumbnailAlt: content.thumbnailAlt,
  tags: content.tags,
});

interface ParsedRevisionPayload {
  readonly details?: Partial<UpdateContentDetailsInput>;
  readonly tags?: readonly string[];
  readonly media?: readonly MediaDraftInput[];
  readonly curriculum?: UpdateCurriculumInput;
  readonly quiz?: QuizDraftInput | null;
}

const parseRevisionPayload = (payloadJson: string): ParsedRevisionPayload | null => {
  try {
    return JSON.parse(payloadJson) as ParsedRevisionPayload;
  } catch {
    return null;
  }
};

const mergeBasicDetails = (
  details: Partial<UpdateContentDetailsInput> | undefined,
  content: ContentDetail,
): Pick<
  UpdateContentDetailsInput,
  'title' | 'subtitle' | 'description' | 'categoryId' | 'topic' | 'tags'
> => {
  if (!details) {
    return {
      title: content.title,
      subtitle: content.subtitle,
      description: content.description,
      categoryId: content.categoryId,
      topic: content.topic,
      tags: content.tags,
    };
  }
  return {
    title: details.title ?? content.title,
    subtitle: details.subtitle ?? content.subtitle,
    description: details.description ?? content.description,
    categoryId: details.categoryId ?? content.categoryId,
    topic: details.topic ?? content.topic,
    tags: details.tags ?? content.tags,
  };
};

const mergeAudienceDetails = (
  details: Partial<UpdateContentDetailsInput> | undefined,
  content: ContentDetail,
): Pick<UpdateContentDetailsInput, 'visibility' | 'branchIds' | 'teamIds'> => {
  if (!details) {
    return {
      visibility: content.visibility,
      branchIds: content.branchIds,
      teamIds: content.teamIds,
    };
  }
  return {
    visibility: details.visibility ?? content.visibility,
    branchIds: details.branchIds !== undefined ? details.branchIds : content.branchIds,
    teamIds: details.teamIds !== undefined ? details.teamIds : content.teamIds,
  };
};

const mergeCourseDetails = (
  details: Partial<UpdateContentDetailsInput> | undefined,
  content: ContentDetail,
): Pick<
  UpdateContentDetailsInput,
  | 'difficulty'
  | 'language'
  | 'durationSeconds'
  | 'keywords'
  | 'thumbnailMediaAssetId'
  | 'thumbnailAlt'
> => {
  const liveThumbId = resolveLiveThumbnailId(content);
  if (!details) {
    return {
      difficulty: content.difficulty,
      language: content.language,
      durationSeconds: content.durationSeconds,
      keywords: content.keywords,
      thumbnailMediaAssetId: liveThumbId,
      thumbnailAlt: content.thumbnailAlt,
    };
  }
  return {
    difficulty: details.difficulty ?? content.difficulty,
    language: details.language ?? content.language,
    durationSeconds:
      details.durationSeconds && details.durationSeconds > 0
        ? details.durationSeconds
        : content.durationSeconds,
    keywords: details.keywords ?? content.keywords,
    thumbnailMediaAssetId:
      details.thumbnailMediaAssetId !== undefined
        ? details.thumbnailMediaAssetId
        : liveThumbId,
    thumbnailAlt: details.thumbnailAlt ?? content.thumbnailAlt,
  };
};

const mergeRevisionDetails = (
  details: Partial<UpdateContentDetailsInput> | undefined,
  content: ContentDetail,
): UpdateContentDetailsInput => ({
  ...mergeBasicDetails(details, content),
  ...mergeCourseDetails(details, content),
  ...mergeAudienceDetails(details, content),
});

const pickDuration = (draft?: number, live?: number): number =>
  draft && draft > 0 ? draft : (live ?? 0);

function enrichDraftItemWithLive(
  draftItem: MediaDraftInput,
  liveMedia: readonly MediaDraftInput[],
): MediaDraftInput {
  const liveMatch = draftItem.id
    ? liveMedia.find((lm) => lm.id === draftItem.id)
    : undefined;
  const externalUrl = draftItem.externalUrl ?? liveMatch?.externalUrl ?? null;

  if (draftItem.sizeBytes > 0 || !draftItem.id) {
    return externalUrl !== draftItem.externalUrl
      ? { ...draftItem, externalUrl }
      : draftItem;
  }
  if (!liveMatch || liveMatch.sizeBytes <= 0) {
    return externalUrl !== draftItem.externalUrl
      ? { ...draftItem, externalUrl }
      : draftItem;
  }

  return {
    ...draftItem,
    sizeBytes: liveMatch.sizeBytes,
    mimeType: draftItem.mimeType ?? liveMatch.mimeType ?? null,
    previewUrl: draftItem.previewUrl ?? liveMatch.previewUrl ?? null,
    displayOrder: draftItem.displayOrder ?? liveMatch.displayOrder,
    durationSeconds: pickDuration(draftItem.durationSeconds, liveMatch.durationSeconds),
    externalUrl,
  };
}

const resolveDraftMedia = (
  parsedMedia: readonly MediaDraftInput[] | undefined,
  liveMedia: readonly MediaDraftInput[],
): readonly MediaDraftInput[] => {
  if (!Array.isArray(parsedMedia) || parsedMedia.length === 0) {
    return liveMedia;
  }
  const resolved = (parsedMedia as readonly MediaDraftInput[]).map((draftItem) =>
    enrichDraftItemWithLive(draftItem, liveMedia),
  );

  const liveThumb = liveMedia.find((m) => m.slot === MEDIA_SLOT.thumbnail);
  if (liveThumb && !resolved.some((m) => m.slot === MEDIA_SLOT.thumbnail)) {
    return [liveThumb, ...resolved];
  }

  return resolved;
};

const resolveDraftCurriculum = (
  parsedCurriculum: UpdateCurriculumInput | undefined,
  liveCurriculum: UpdateCurriculumInput | undefined,
  contentTypeKey: 'course' | 'tutorial' | 'resource',
): UpdateCurriculumInput | undefined => {
  if (contentTypeKey !== 'course') {
    return undefined;
  }
  if (!parsedCurriculum) {
    return sanitizeCurriculum(liveCurriculum);
  }
  const rawSections = parsedCurriculum.sections.map((section, sIdx) => {
    const liveSection = liveCurriculum?.sections.find((s) => s.id === section.id);
    const rawLessons = section.lessons.map((lesson, lIdx) => {
      const liveLesson = liveSection?.lessons.find((l) => l.id === lesson.id);
      const displayOrder = lesson.displayOrder ?? liveLesson?.displayOrder ?? lIdx;
      if (lesson.assignmentFiles && lesson.assignmentFiles.length > 0) {
        return {
          ...lesson,
          displayOrder,
        };
      }
      return {
        ...lesson,
        displayOrder,
        assignmentFiles: liveLesson?.assignmentFiles ?? null,
      };
    });
    const orderedLessons = normalizeDisplayOrders(rawLessons);
    return {
      ...section,
      displayOrder: section.displayOrder ?? liveSection?.displayOrder ?? sIdx,
      lessons: orderedLessons,
    };
  });
  const orderedSections = normalizeDisplayOrders(rawSections);
  return sanitizeCurriculum({ sections: orderedSections });
};

export const createInitialDraftState = (
  content: ContentDetail,
  activeRevision: ContentRevision | null | undefined,
  contentTypeKey: 'course' | 'tutorial' | 'resource',
): ContentDraftStateInput => {
  const liveMedia = createLiveMedia(content.media, content.id);
  const liveCurriculum = createLiveCurriculum(content, contentTypeKey);

  if (!activeRevision?.payloadJson) {
    return {
      details: createLiveDetails(content),
      tags: content.tags,
      media: liveMedia,
      curriculum: liveCurriculum,
    };
  }

  const parsed = parseRevisionPayload(activeRevision.payloadJson);
  if (!parsed) {
    return {
      details: createLiveDetails(content),
      tags: content.tags,
      media: liveMedia,
      curriculum: liveCurriculum,
    };
  }

  const media = resolveDraftMedia(parsed.media, liveMedia);
  const curriculum = resolveDraftCurriculum(
    parsed.curriculum,
    liveCurriculum,
    contentTypeKey,
  );

  return {
    details: mergeRevisionDetails(parsed.details, content),
    tags: parsed.tags ?? content.tags,
    media,
    curriculum,
    quiz: parsed.quiz ?? undefined,
  };
};

export {
  resolveRevisionStatus,
  type RevisionStatusInfo,
} from './revision-status-resolver';
