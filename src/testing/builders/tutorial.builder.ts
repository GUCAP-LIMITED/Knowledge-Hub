import { Tutorial, type TutorialProps } from '@features/tutorials/domain';

export type TutorialOverrides = Partial<TutorialProps>;

const DEFAULT_TUTORIAL: TutorialProps = {
  id: 'tutorial-1',
  title: 'Adding a Student',
  subtitle: null,
  category: 'Students',
  duration: '5 min',
  views: 1245,
  difficulty: 'Beginner',
  description: 'Create and enrol a new student record.',
  updatedAt: new Date('2026-07-01T00:00:00.000Z'),
  mediaAssetId: 'media-asset-1',
  thumbnailUrl: null,
  quizId: null,
  isQuizRequired: false,
  helpfulCount: 0,
  isHelpful: false,
  rating: 0,
  totalReviews: 0,
  canModify: false,
};

/** Construct a valid {@link Tutorial} for tests, overriding only what matters per case. */
export const buildTutorial = (overrides: TutorialOverrides = {}): Tutorial =>
  new Tutorial({ ...DEFAULT_TUTORIAL, ...overrides });
