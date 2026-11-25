import { categoryName, certificateIdFor, ratingOf } from '../content-index';
import {
  can,
  normalizeQuery,
  notFound,
  paginate,
  requireUser,
  sortBy,
} from '../mock-context';
import type { MockState } from '../mock-state';
import type { MockRequest, MockRoute } from '../mock-types';
import { categoryId } from '../seed/categories';
import { findMediaAsset } from '../seed/media-assets';
import type { MockUser } from '../seed/mock-users';
import { svgThumb } from '../seed/svg-thumb';
import type { TutorialSeed } from '../seed/tutorial-seed';

const BASE = '/api/app/tutorial';
const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced'] as const;

const findTutorial = (state: MockState, idOrSlug: string): TutorialSeed => {
  const tutorial = state.tutorials.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
  if (tutorial === undefined) {
    throw notFound('Tutorial');
  }
  return tutorial;
};

const completionKey = (user: MockUser, id: string): string => `${user.id}:${id}`;

const tutorialDuration = (t: TutorialSeed): number =>
  t.videos.reduce((sum, v) => sum + v.minutes * 60, 0);

const toRow = (
  state: MockState,
  t: TutorialSeed,
  user: MockUser,
): Record<string, unknown> => {
  const done = state.completions.get(completionKey(user, t.id));
  const finished = done?.at !== undefined && done.at !== null;
  const videos = t.videos.map((v, index) => {
    const asset = findMediaAsset(v.assetId);
    return {
      id: v.assetId,
      originalFileName: `${v.title}.mp4`,
      title: v.title,
      slot: 20,
      kind: 5,
      streamStatus: 0,
      durationSeconds: v.minutes * 60,
      displayOrder: index,
      url: asset?.url ?? null,
      externalUrl: null,
      mimeType: 'video/mp4',
      sizeBytes: asset?.sizeBytes ?? 0,
      isMediaCompleted: done?.videos.has(v.assetId) ?? false,
    };
  });
  const completedCount = videos.filter((v) => v.isMediaCompleted).length;
  const first = videos[0];
  const rating = ratingOf(state, t.id);
  const helpful = state.helpfulVotes.has(completionKey(user, t.id));
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    description: t.description,
    categoryId: categoryId(5, t.category),
    categoryName: categoryName(state, categoryId(5, t.category)) ?? t.category,
    durationSeconds: tutorialDuration(t),
    difficulty: t.difficulty,
    difficultyName: DIFFICULTY[t.difficulty / 5],
    visibility: t.visibility,
    thumbnailUrl: svgThumb(t.title, t.hue),
    quizId: t.quizId,
    isQuizRequired: t.quizId !== null,
    isCompleted: finished,
    completedAt: done?.at ?? null,
    certificateId: finished ? certificateIdFor(user.id, t.id) : null,
    certificateUrl: null,
    helpfulCount: t.helpfulCount + (helpful ? 1 : 0),
    isHelpful: helpful,
    averageRating: rating.average,
    rating: rating.average,
    totalReviews: rating.total,
    canModify: can(state, user, 'Tutorials.Edit'),
    primaryMedia: first === undefined ? null : { id: first.id, url: first.url },
    videos,
    completedVideosCount: completedCount,
    totalVideosCount: videos.length,
    progressPercent:
      videos.length === 0 ? 0 : Math.round((completedCount / videos.length) * 100),
    creationTime: t.createdAt,
    lastModificationTime: t.createdAt,
  };
};

const sorters = (
  state: MockState,
): Record<string, (item: TutorialSeed) => string | number> => ({
  title: (t: TutorialSeed): string => t.title,
  creationtime: (t: TutorialSeed): number => Date.parse(t.createdAt),
  rating: (t: TutorialSeed): number => ratingOf(state, t.id).average,
  duration: (t: TutorialSeed): number => tutorialDuration(t),
});

const catalog = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const query = normalizeQuery(request.query);
  const needle = (query.filter ?? '').toLowerCase();
  const matches = state.tutorials.filter(
    (t) =>
      (needle === '' ||
        `${t.title} ${t.subtitle} ${t.category}`.toLowerCase().includes(needle)) &&
      (query.categoryid === undefined ||
        categoryId(5, t.category) === query.categoryid) &&
      (query.category === undefined || t.category === query.category),
  );
  const page = paginate(sortBy(matches, query.sorting, sorters(state)), query);
  return {
    items: page.items.map((t) => toRow(state, t, user)),
    totalCount: page.totalCount,
  };
};

const completeVideo = (state: MockState, request: MockRequest, all: boolean): unknown => {
  const user = requireUser(request);
  const tutorial = findTutorial(state, request.params.id ?? '');
  const key = completionKey(user, tutorial.id);
  const existing = state.completions.get(key);
  const videos = existing?.videos ?? new Set<string>();
  if (all) {
    tutorial.videos.forEach((v) => videos.add(v.assetId));
  } else {
    videos.add(request.params.mediaId ?? '');
  }
  const allDone = tutorial.videos.every((v) => videos.has(v.assetId));
  state.completions.set(key, {
    at: allDone ? (existing?.at ?? state.now.toISOString()) : null,
    videos,
  });
  return toRow(state, tutorial, user);
};

export const tutorialHandlers = (state: MockState): readonly MockRoute[] => [
  { method: 'GET', pattern: `${BASE}/catalog`, handler: (r) => catalog(state, r) },
  {
    method: 'GET',
    pattern: `${BASE}/:id/catalog-item`,
    handler: (r) => toRow(state, findTutorial(state, r.params.id ?? ''), requireUser(r)),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/mark-complete`,
    handler: (r) => completeVideo(state, r, true),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/videos/:mediaId/complete`,
    handler: (r) => completeVideo(state, r, false),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/mark-helpful`,
    handler: (r) => {
      const key = completionKey(
        requireUser(r),
        findTutorial(state, r.params.id ?? '').id,
      );
      if (!state.helpfulVotes.delete(key)) {
        state.helpfulVotes.add(key);
      }
      return null;
    },
  },
];
