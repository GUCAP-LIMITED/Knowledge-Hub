import type { MockState } from './mock-state';
import { courseCategoryId } from './seed/course-seed';
import { categoryId } from './seed/categories';
import { svgThumb } from './seed/svg-thumb';

export interface CatalogRef {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  /** 0 course · 5 tutorial · 10 resource. */
  readonly type: 0 | 5 | 10;
  readonly typeName: 'Course' | 'Tutorial' | 'Resource';
  readonly categoryId: string;
  readonly thumbnailUrl: string;
}

/** Every published learning item, regardless of kind. */
export const catalogRefs = (state: MockState): readonly CatalogRef[] => [
  ...state.courses.map(
    (c): CatalogRef => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      type: 0,
      typeName: 'Course',
      categoryId: courseCategoryId(c),
      thumbnailUrl: svgThumb(c.title, c.hue),
    }),
  ),
  ...state.tutorials.map(
    (t): CatalogRef => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      subtitle: t.subtitle,
      type: 5,
      typeName: 'Tutorial',
      categoryId: categoryId(5, t.category),
      thumbnailUrl: svgThumb(t.title, t.hue),
    }),
  ),
  ...state.resources.map(
    (r): CatalogRef => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      type: 10,
      typeName: 'Resource',
      categoryId: categoryId(10, r.category),
      thumbnailUrl: svgThumb(r.title, r.hue),
    }),
  ),
];

export const findRef = (state: MockState, idOrSlug: string): CatalogRef | undefined =>
  catalogRefs(state).find((ref) => ref.id === idOrSlug || ref.slug === idOrSlug);

export const categoryName = (state: MockState, id: string | null): string | null =>
  state.categories.find((c) => c.id === id)?.name ?? null;

export const certificateIdFor = (userId: string, contentId: string): string =>
  `cert-${userId}-${contentId}`;

export interface Rating {
  readonly average: number;
  readonly total: number;
}

/** Live rating for an item, derived from its reviews so cards and review lists always agree. */
export const ratingOf = (state: MockState, contentId: string): Rating => {
  const reviews = state.reviews.filter((r) => r.contentId === contentId);
  if (reviews.length === 0) {
    return { average: 0, total: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, total: reviews.length };
};

/** A stable pseudo-random hue (0-359) derived from an id, for generated thumbnails. */
export const hueOf = (text: string): number => {
  let hue = 7;
  for (let i = 0; i < text.length; i += 1) {
    hue = (hue * 31 + text.charCodeAt(i)) % 360;
  }
  return hue;
};
