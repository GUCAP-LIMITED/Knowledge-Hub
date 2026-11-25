import { categoryName, hueOf } from './content-index';
import type { MockState } from './mock-state';
import type { CategoryName } from './seed/categories';
import type { CourseSeed } from './seed/course-seed';
import type { ResourceSeed } from './seed/resource-seed';
import type { MockContentItem } from './seed/submission-seed';
import type { TutorialSeed } from './seed/tutorial-seed';

const CATEGORY_FALLBACK: CategoryName = 'Onboarding';

const categoryOf = (state: MockState, item: MockContentItem): CategoryName =>
  (categoryName(state, item.categoryId) as CategoryName | null) ?? CATEGORY_FALLBACK;

const difficultyOf = (item: MockContentItem): 0 | 5 | 10 =>
  item.difficulty >= 10 ? 10 : item.difficulty >= 5 ? 5 : 0;

const visibilityOf = (item: MockContentItem): 0 | 5 | 10 =>
  item.visibility >= 10 ? 10 : item.visibility >= 5 ? 5 : 0;

const common = (
  state: MockState,
  item: MockContentItem,
): Omit<CourseSeed, 'mandatory' | 'introAssetId' | 'sections' | 'difficulty'> => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  subtitle: item.subtitle ?? '',
  description: item.description ?? '',
  category: categoryOf(state, item),
  hue: hueOf(item.id),
  createdAt: state.now.toISOString(),
  enrollmentCount: 0,
  helpfulCount: 0,
});

const publishCourse = (state: MockState, item: MockContentItem): void => {
  state.courses.unshift({
    ...common(state, item),
    difficulty: difficultyOf(item),
    mandatory: false,
    introAssetId: null,
    sections: item.sections,
  });
};

const publishTutorial = (state: MockState, item: MockContentItem): void => {
  const videos = item.media.filter((m) => m.mimeType?.startsWith('video') ?? false);
  const { enrollmentCount: _e, ...base } = common(state, item);
  const tutorial: TutorialSeed = {
    ...base,
    difficulty: difficultyOf(item),
    visibility: visibilityOf(item),
    quizId: item.quizId,
    videos: (videos.length > 0
      ? videos
      : [{ id: 'asset-vid-1', durationSeconds: 300, originalFileName: item.title }]
    ).map((m) => ({
      assetId: m.id,
      title: m.originalFileName.replace(/\.[^.]+$/, ''),
      minutes: Math.max(1, Math.round(m.durationSeconds / 60) || 5),
    })),
  };
  state.tutorials.unshift(tutorial);
};

const publishResource = (state: MockState, item: MockContentItem): void => {
  const files = item.media.filter((m) => !(m.mimeType?.startsWith('image') ?? false));
  const resource: ResourceSeed = {
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle ?? '',
    description: item.description ?? '',
    type: 'Document',
    category: categoryOf(state, item),
    visibility: visibilityOf(item),
    hue: hueOf(item.id),
    createdAt: state.now.toISOString(),
    helpfulCount: 0,
    primaryAssetId: files[0]?.id ?? 'asset-pdf-1',
    attachmentAssetIds: files.slice(1).map((m) => m.id),
  };
  state.resources.unshift(resource);
};

/** Copies an approved submission into the learner-facing catalogue (the record keeps its author). */
export const publishToCatalog = (state: MockState, item: MockContentItem): void => {
  if (item.type === 0) publishCourse(state, item);
  else if (item.type === 5) publishTutorial(state, item);
  else publishResource(state, item);
};
