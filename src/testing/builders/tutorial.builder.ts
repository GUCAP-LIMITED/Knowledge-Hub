import { Tutorial, type TutorialProps } from '@features/tutorials/domain';

export type TutorialOverrides = Partial<TutorialProps>;

/** Construct a valid {@link Tutorial} for tests, overriding only what matters per case. */
export const buildTutorial = (overrides: TutorialOverrides = {}): Tutorial =>
  new Tutorial({
    id: overrides.id ?? 'tutorial-1',
    title: overrides.title ?? 'Adding a Student',
    category: overrides.category ?? 'Students',
    duration: overrides.duration ?? '5 min',
    views: overrides.views ?? 1245,
    difficulty: overrides.difficulty ?? 'Beginner',
    description: overrides.description ?? 'Create and enrol a new student record.',
    updatedAt: overrides.updatedAt ?? new Date('2026-07-01T00:00:00.000Z'),
  });
