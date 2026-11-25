import { parseDuration } from '@shared/utils';
import type { Tutorial } from '../domain';

export type TutorialSort = 'recent' | 'popular' | 'shortest' | 'az';

export const SORT_OPTIONS: readonly {
  readonly value: TutorialSort;
  readonly label: string;
}[] = [
  { value: 'recent', label: 'Recently updated' },
  { value: 'popular', label: 'Most viewed' },
  { value: 'shortest', label: 'Shortest first' },
  { value: 'az', label: 'A – Z' },
];

const getDurationSeconds = (tutorial: Tutorial): number => {
  if (typeof tutorial.durationSeconds === 'number' && tutorial.durationSeconds > 0) {
    return tutorial.durationSeconds;
  }
  const parsed = parseDuration(tutorial.duration);
  return parsed > 0 ? parsed : Number.MAX_SAFE_INTEGER;
};

const matchesQuery = (tutorial: Tutorial, q: string): boolean =>
  q === '' ||
  tutorial.title.toLowerCase().includes(q) ||
  tutorial.category.toLowerCase().includes(q) ||
  tutorial.description.toLowerCase().includes(q);

const compare =
  (sort: TutorialSort) =>
  (a: Tutorial, b: Tutorial): number => {
    if (sort === 'popular') {
      return b.views - a.views;
    }
    if (sort === 'shortest') {
      return getDurationSeconds(a) - getDurationSeconds(b);
    }
    if (sort === 'az') {
      return a.title.localeCompare(b.title);
    }
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  };

/** Filter by category + a query that spans title, category and description, then sort. */
export const filterAndSortTutorials = (
  tutorials: readonly Tutorial[],
  query: string,
  category: string,
  sort: TutorialSort,
): readonly Tutorial[] => {
  const q = query.trim().toLowerCase();
  return tutorials
    .filter(
      (tutorial) =>
        (category === 'all' || tutorial.category === category) &&
        matchesQuery(tutorial, q),
    )
    .sort(compare(sort));
};
