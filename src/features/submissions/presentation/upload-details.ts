/** The full authoring detail set captured in the Details step. */
export interface Details {
  title: string;
  type: string;
  subtitle: string;
  description: string;
  category: string;
  restrictToBranch: boolean; // toggle: off = all branches, on = restrict to a branch
  branch: string; // the chosen branch id (multi-branch authors); '' otherwise
  topic: string;
  difficulty: string;
  thumbnailAlt: string;
  coverAlt: string;
  tags: string;
  language: string;
  duration: string;
  visibility: Visibility;
  keywords: string;
}

export type Visibility = 'public' | 'team' | 'private';

export const DIFFICULTIES: readonly string[] = ['Beginner', 'Intermediate', 'Advanced'];
export const LANGUAGES: readonly string[] = [
  'English',
  'Bengali',
  'Hindi',
  'Arabic',
  'Spanish',
];

export interface VisibilityOption {
  readonly value: Visibility;
  readonly title: string;
  readonly desc: string;
}

export const VISIBILITY_OPTIONS: readonly VisibilityOption[] = [
  {
    value: 'public',
    title: 'Public',
    desc: 'Anyone in UAPP Academy can find and open this.',
  },
  { value: 'team', title: 'Team only', desc: 'Visible to your team and managers.' },
  { value: 'private', title: 'Private', desc: 'Only you, until you choose to share.' },
];

export const EMPTY_DETAILS: Details = {
  title: '',
  type: '',
  subtitle: '',
  description: '',
  category: '',
  restrictToBranch: false,
  branch: '',
  topic: '',
  difficulty: '', // unselected — the Details step requires an explicit choice
  thumbnailAlt: '',
  coverAlt: '',
  tags: '',
  language: 'English',
  duration: '',
  visibility: 'team',
  keywords: '',
};

/** Required fields that must be present before publishing (used by the preview step). */
export const missingRequired = (details: Details): readonly string[] => {
  const missing: string[] = [];
  if (details.title.trim().length < 3) {
    missing.push('Title');
  }
  if (details.description.trim().length === 0) {
    missing.push('Description');
  }
  if (details.category.trim().length === 0) {
    missing.push('Category');
  }
  if (details.difficulty.trim().length === 0) {
    missing.push('Difficulty');
  }
  return missing;
};
