import { formatDuration as formatSharedDuration } from '@shared/utils';

export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return 'Not specified';
  return formatSharedDuration(seconds, { emptyFallback: 'Not specified' });
};

export const getDifficultyLabel = (diff: number): string => {
  switch (diff) {
    case 0:
      return 'Beginner';
    case 5:
      return 'Intermediate';
    case 10:
      return 'Advanced';
    default:
      return 'All Levels';
  }
};

export const getVisibilityLabel = (vis: number): string => {
  switch (vis) {
    case 0:
      return 'Public (All Learners)';
    case 5:
      return 'Team Specific';
    case 10:
      return 'Private';
    default:
      return 'Public';
  }
};
