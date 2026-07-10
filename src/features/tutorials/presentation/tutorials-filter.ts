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

const durationMinutes = (duration: string): number => {
  const match = /\d+/.exec(duration);
  return match === null ? Number.MAX_SAFE_INTEGER : Number(match[0]);
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
      return durationMinutes(a.duration) - durationMinutes(b.duration);
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
