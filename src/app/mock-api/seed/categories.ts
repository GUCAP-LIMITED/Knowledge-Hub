export interface MockCategory {
  readonly id: string;
  /** Content type: 0 course · 5 tutorial · 10 resource. */
  readonly type: 0 | 5 | 10;
  readonly name: string;
  readonly slug: string;
}

const NAMES = [
  'Onboarding',
  'Admissions',
  'Compliance',
  'Sales & Communication',
  'Student Support',
] as const;

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-');

const TYPE_KEY = { 0: 'course', 5: 'tutorial', 10: 'resource' } as const;

export const categoryId = (type: 0 | 5 | 10, name: (typeof NAMES)[number]): string =>
  `cat-${TYPE_KEY[type]}-${slugify(name)}`;

export const createCategories = (): MockCategory[] =>
  ([0, 5, 10] as const).flatMap((type) =>
    NAMES.map((name) => ({
      id: categoryId(type, name),
      type,
      name,
      slug: slugify(name),
    })),
  );

export type CategoryName = (typeof NAMES)[number];
