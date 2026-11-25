import { categoryName, hueOf } from './content-index';
import { can } from './mock-context';
import type { MockState } from './mock-state';
import { categoryId } from './seed/categories';
import { courseCategoryId, type SectionSeed } from './seed/course-seed';
import { findMediaAsset } from './seed/media-assets';
import type { MockUser } from './seed/mock-users';
import { emptyContent, type MockContentItem } from './seed/submission-seed';
import { svgThumb } from './seed/svg-thumb';

/** `MEDIA_SLOT` values the editor understands (thumbnail 0 · lesson 10 · attachment 15 · primary 20 · resource file 25). */
const SLOT = {
  thumbnail: 0,
  lesson: 10,
  attachment: 15,
  primary: 20,
  resourceFile: 25,
} as const;

interface MediaSpec {
  readonly assetId: string;
  readonly lessonId: string | null;
  readonly order: number;
  readonly slot: number;
}

const mediaOf = ({
  assetId,
  lessonId,
  order,
  slot,
}: MediaSpec): MockContentItem['media'][number] | null => {
  const asset = findMediaAsset(assetId);
  return asset === undefined
    ? null
    : {
        id: asset.id,
        slot,
        kind: asset.kind,
        originalFileName: asset.fileName,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        url: asset.url,
        referencedLessonId: lessonId,
        displayOrder: order,
        durationSeconds: 0,
      };
};

/** Every published item carries a thumbnail, as real content must (the editor requires one). */
const thumbnailMedia = (contentId: string): MockContentItem['media'][number] => ({
  id: `upload-img-thumb-${contentId}`,
  slot: SLOT.thumbnail,
  kind: 10,
  originalFileName: 'thumbnail.png',
  mimeType: 'image/png',
  sizeBytes: 90_000,
  url: '/favicon.svg',
  referencedLessonId: null,
  displayOrder: 0,
  durationSeconds: 0,
});

const OWNER = { id: 'user-manager', name: 'Daniel Okafor' };

const notNull = <T>(value: T | null): value is T => value !== null;

const courseAsContent = (course: MockState['courses'][number]): MockContentItem => {
  const lessons = course.sections.flatMap((s) => s.lessons);
  return {
    ...emptyContent({
      id: course.id,
      type: 0,
      title: course.title,
      owner: OWNER,
      nowIso: course.createdAt,
    }),
    slug: course.slug,
    status: 20,
    difficulty: course.difficulty,
    subtitle: course.subtitle,
    description: course.description,
    categoryId: courseCategoryId(course),
    durationSeconds: lessons.reduce((n, l) => n + l.minutes * 60, 0),
    sections: course.sections.map((s) => ({ ...s, lessons: [...s.lessons] })),
    media: lessons
      .flatMap((l, i) =>
        l.mediaAssetId === undefined
          ? []
          : [
              mediaOf({
                assetId: l.mediaAssetId,
                lessonId: l.id,
                order: i,
                slot: SLOT.lesson,
              }),
            ],
      )
      .filter(notNull)
      .concat(thumbnailMedia(course.id)),
    submittedAt: course.createdAt,
  };
};

const tutorialAsContent = (
  tutorial: MockState['tutorials'][number],
): MockContentItem => ({
  ...emptyContent({
    id: tutorial.id,
    type: 5,
    title: tutorial.title,
    owner: OWNER,
    nowIso: tutorial.createdAt,
  }),
  slug: tutorial.slug,
  status: 20,
  difficulty: tutorial.difficulty,
  visibility: tutorial.visibility,
  subtitle: tutorial.subtitle,
  description: tutorial.description,
  categoryId: categoryId(5, tutorial.category),
  quizId: tutorial.quizId,
  durationSeconds: tutorial.videos.reduce((n, v) => n + v.minutes * 60, 0),
  media: tutorial.videos
    .map((v, i) =>
      mediaOf({ assetId: v.assetId, lessonId: null, order: i, slot: SLOT.primary }),
    )
    .filter(notNull)
    .concat(thumbnailMedia(tutorial.id)),
  submittedAt: tutorial.createdAt,
});

const resourceAsContent = (
  resource: MockState['resources'][number],
): MockContentItem => ({
  ...emptyContent({
    id: resource.id,
    type: 10,
    title: resource.title,
    owner: OWNER,
    nowIso: resource.createdAt,
  }),
  slug: resource.slug,
  status: 20,
  visibility: resource.visibility,
  subtitle: resource.subtitle,
  description: resource.description,
  categoryId: categoryId(10, resource.category),
  media: [resource.primaryAssetId, ...resource.attachmentAssetIds]
    .map((assetId, i) =>
      mediaOf({
        assetId,
        lessonId: null,
        order: i,
        slot: i === 0 ? SLOT.resourceFile : SLOT.attachment,
      }),
    )
    .filter(notNull)
    .concat(thumbnailMedia(resource.id)),
  submittedAt: resource.createdAt,
});

/** A published catalogue item viewed as a content record (so it can be opened, edited via revisions). */
export const catalogAsContent = (
  state: MockState,
  id: string,
): MockContentItem | undefined => {
  const course = state.courses.find((c) => c.id === id);
  const tutorial = state.tutorials.find((t) => t.id === id);
  const resource = state.resources.find((r) => r.id === id);
  if (course !== undefined) return courseAsContent(course);
  if (tutorial !== undefined) return tutorialAsContent(tutorial);
  return resource === undefined ? undefined : resourceAsContent(resource);
};

export const findContent = (state: MockState, id: string): MockContentItem | undefined =>
  state.submissions.find((s) => s.id === id) ?? catalogAsContent(state, id);

const sectionDto = (section: SectionSeed, index: number): Record<string, unknown> => ({
  id: section.id,
  title: section.title,
  displayOrder: index,
  lessons: section.lessons.map((l, li) => ({
    id: l.id,
    title: l.title,
    kind: l.kind,
    displayOrder: li,
    mediaAssetId: l.mediaAssetId ?? null,
    externalUrl: l.externalUrl ?? null,
    quizId: l.quizId ?? null,
    durationSeconds: l.minutes * 60,
    isPreview: l.isPreview ?? false,
    attachments: [],
  })),
});

const canModifyItem = (
  state: MockState,
  user: MockUser,
  item: MockContentItem,
): boolean =>
  item.ownerId === user.id ||
  can(state, user, 'Approvals.Approve') ||
  can(state, user, 'Courses.Edit');

/** The listing row (`ContentListItemDto`). */
export const toListRow = (
  state: MockState,
  user: MockUser,
  item: MockContentItem,
): Record<string, unknown> => ({
  id: item.id,
  type: item.type,
  title: item.title,
  status: item.status,
  difficulty: item.difficulty,
  visibility: item.visibility,
  durationSeconds: item.durationSeconds,
  thumbnailUrl: svgThumb(item.title, hueOf(item.id)),
  ownerId: item.ownerId,
  ownerName: item.ownerName,
  submittedById: item.status === 0 ? null : item.ownerId,
  submittedByName: item.status === 0 ? null : item.ownerName,
  submittedAt: item.submittedAt,
  reviewNote: item.reviewNote,
  creationTime: item.creationTime,
  categoryId: item.categoryId,
  canModify: canModifyItem(state, user, item),
});

/** The full detail payload (`ContentDetailDto`). */
export const toDetailDto = (
  state: MockState,
  user: MockUser,
  item: MockContentItem,
): Record<string, unknown> => ({
  ...toListRow(state, user, item),
  slug: item.slug,
  branchIds: item.branchIds,
  teamIds: item.teamIds,
  subtitle: item.subtitle,
  description: item.description,
  topic: item.topic,
  language: item.language,
  keywords: item.keywords,
  thumbnailAlt: item.thumbnailAlt,
  thumbnailMediaAssetId: item.media.find((m) => m.slot === SLOT.thumbnail)?.id ?? null,
  quizId: item.quizId,
  isQuizRequired: item.quizId !== null,
  reviewedById: item.reviewedByName === null ? null : 'user-admin',
  reviewedByName: item.reviewedByName,
  tags: item.tags,
  media: item.media,
  sections: item.sections.map(sectionDto),
  categoryName: categoryName(state, item.categoryId),
});
