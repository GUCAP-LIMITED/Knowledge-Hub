export interface MockReview {
  readonly id: string;
  readonly contentId: string;
  readonly userId: string;
  readonly rating: number;
  readonly feedback: string;
  readonly creationTime: string;
  /** Users who marked this review helpful. */
  readonly helpfulBy: Set<string>;
}

const FEEDBACK: readonly string[] = [
  'Clear, practical and well paced. I used the checklist the very next day.',
  'Good content overall — a few more real examples would make it perfect.',
  'Exactly what I needed in my first month. Would recommend to every new starter.',
  'The videos were short and to the point. The quiz was a fair check.',
  'Helpful, though some sections felt rushed.',
  'Brilliant! My team lead asked us all to complete this.',
];

const REVIEWERS = [
  'user-consultant',
  'user-manager',
  'user-cons-2',
  'user-cons-3',
  'user-cons-4',
  'user-cons-5',
] as const;

const daysAgo = (now: Date, days: number): string =>
  new Date(now.getTime() - days * 86_400_000).toISOString();

/** Deterministic reviews spread across every catalogue item (courses, tutorials, resources). */
export const createReviews = (now: Date, contentIds: readonly string[]): MockReview[] =>
  contentIds.flatMap((contentId, ci) =>
    REVIEWERS.slice(0, 2 + (ci % 4)).map((userId, ri) => ({
      id: `rev-${String(ci + 1)}-${String(ri + 1)}`,
      contentId,
      userId,
      rating: 3 + ((ci + ri) % 3),
      feedback: FEEDBACK[(ci + ri) % FEEDBACK.length] ?? '',
      creationTime: daysAgo(now, 2 + ci * 3 + ri * 2),
      helpfulBy: new Set<string>(
        ri === 0 ? [REVIEWERS[(ci + 1) % REVIEWERS.length] ?? ''] : [],
      ),
    })),
  );
