import { categoryNameOf } from '../course-view';
import type { MockState } from '../mock-state';
import type { MockRoute } from '../mock-types';
import { findMediaAsset } from '../seed/media-assets';

interface Hit {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly categoryName: string;
  readonly slug: string;
  readonly type: number;
}

export type SearchSource = (state: MockState) => readonly Hit[];

const courseSource: SearchSource = (state) =>
  state.courses.map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    categoryName: categoryNameOf(state, course),
    slug: course.slug,
    type: 0,
  }));

const tutorialSource: SearchSource = (state) =>
  state.tutorials.map((t) => ({
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    categoryName: t.category,
    slug: t.slug,
    type: 5,
  }));

const resourceSource: SearchSource = (state) =>
  state.resources.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    categoryName: r.category,
    slug: r.slug,
    type: 10,
  }));

export const searchHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: '/api/app/search',
    handler: ({ query }) => {
      const needle = (query.query ?? '').trim().toLowerCase();
      const max = Number(query.maxPerCategory ?? 5);
      const type = query.type === undefined ? undefined : Number(query.type);
      const hits = [courseSource, tutorialSource, resourceSource]
        .flatMap((source) => source(state))
        .filter(
          (hit) =>
            (type === undefined || hit.type === type) &&
            [hit.title, hit.subtitle, hit.categoryName].some((t) =>
              t.toLowerCase().includes(needle),
            ),
        );
      const pick = (kind: number): Hit[] =>
        hits.filter((h) => h.type === kind).slice(0, max);
      return { courses: pick(0), tutorials: pick(5), resources: pick(10) };
    },
  },
];

export const playbackHandlers = (): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: '/api/app/playback/:id',
    handler: ({ params }) => {
      const asset = findMediaAsset(params.id ?? '');
      return {
        url: asset?.url ?? '',
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      };
    },
  },
];
