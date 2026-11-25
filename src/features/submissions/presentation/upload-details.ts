import {
  CONTENT_VISIBILITY,
  type AudienceGroupState,
  type BranchOption,
  type UserScopeData,
} from '@features/content';
import { generateGuid, isRichTextEmpty } from '@shared/utils';

/** The full authoring detail set captured in the Details step. */
export interface Details {
  title: string;
  type: string;
  subtitle: string;
  description: string;
  category: string;
  branches: string[]; // selected branch IDs
  teams: string[]; // selected team IDs (when visibility is 'team')
  audienceGroups: AudienceGroupState[]; // rich multi-group branch-unique rules
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

export const visibilityNumberToFormValue = (vis?: number | null): 'team' | 'private' => {
  if (vis === CONTENT_VISIBILITY.private) return 'private';
  return 'team';
};

export const compiledVisibilityToNumber = (vis: Visibility): number => {
  if (vis === 'private') return CONTENT_VISIBILITY.private;
  if (vis === 'team') return CONTENT_VISIBILITY.team;
  return CONTENT_VISIBILITY.public;
};

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
    value: 'team',
    title: 'Targeted Access',
    desc: 'Configure specific audience groups with custom branch and team permissions.',
  },
  {
    value: 'private',
    title: 'Private',
    desc: 'Only you and managers, until you choose to share.',
  },
];

export const createDefaultAudienceGroup = (): AudienceGroupState => ({
  id: generateGuid(),
  isAllBranches: true,
  branchIds: [],
  accessType: 'public',
  teamIds: [],
});

export const EMPTY_DETAILS: Details = {
  title: '',
  type: '',
  subtitle: '',
  description: '',
  category: '',
  branches: [],
  teams: [],
  audienceGroups: [createDefaultAudienceGroup()],
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

/** Compiles Audience Groups into the target API payload representation. */
export const compileAudienceGroups = (
  groups: readonly AudienceGroupState[],
  visibility: Visibility,
  allBranches: readonly BranchOption[],
  activeBranchId?: string,
): { branches: string[]; teams: string[]; visibility: Visibility } => {
  if (visibility === 'private') {
    const fallbackBranch = activeBranchId ?? allBranches[0]?.id ?? '';
    return {
      branches: fallbackBranch ? [fallbackBranch] : [],
      teams: [],
      visibility: 'private',
    };
  }

  if (groups.length === 0) {
    return {
      branches: [],
      teams: [],
      visibility: 'public',
    };
  }

  // Team resolution
  const teamGroups = groups.filter((g) => g.accessType === 'teams');

  // If every group is public, visibility is public; otherwise team
  const resolvedVisibility: Visibility = teamGroups.length === 0 ? 'public' : 'team';

  // Branch resolution: All-branches compiles to an empty array so backend treats it as organization-wide,
  // matching EF Core scoping (!e.BranchIds.Any()) for both Public and Team access.
  const hasAllBranches = groups.some((g) => g.isAllBranches && g.branchIds.length === 0);
  const resolvedBranches: string[] = hasAllBranches
    ? []
    : Array.from(new Set(groups.flatMap((g) => g.branchIds)));

  const resolvedTeams: string[] = Array.from(
    new Set(teamGroups.flatMap((g) => g.teamIds)),
  );

  return {
    branches: resolvedBranches,
    teams: resolvedTeams,
    visibility: resolvedVisibility,
  };
};

const shouldPreserveGroups = (
  groups: readonly AudienceGroupState[],
  branchCount: number,
): boolean => {
  if (groups.length > 1) return true;
  if (groups.length === 0) return false;
  const first = groups[0];
  if (!first) return false;
  return first.branchIds.length > 0 || (!first.isAllBranches && branchCount === 0);
};

/** Reconstructs audience groups from an existing details model. */
export const hydrateAudienceGroups = (
  details: Details,
  _userScopeData?: UserScopeData,
): AudienceGroupState[] => {
  if (shouldPreserveGroups(details.audienceGroups, details.branches.length)) {
    return details.audienceGroups;
  }

  const isAll = details.branches.length === 0;

  return [
    {
      id: generateGuid(),
      isAllBranches: isAll,
      branchIds: isAll ? [] : details.branches,
      accessType: details.visibility === 'public' ? 'public' : 'teams',
      teamIds: details.teams,
    },
  ];
};

export const FIELD_LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  SUBTITLE_MAX: 300,
  DESCRIPTION_MAX: 4000,
  TOPIC_MAX: 200,
  LANGUAGE_MAX: 50,
  KEYWORDS_MAX: 1000,
  THUMBNAIL_ALT_MAX: 300,
  TAG_MAX: 80,
  SECTION_MAX: 200,
  SECTION_TITLE_MAX: 200,
  LESSON_MAX: 300,
  LESSON_TITLE_MAX: 300,
  EXTERNAL_URL_MAX: 1000,
  QUIZ_TITLE_MAX: 256,
} as const;

/** Checks string length boundaries mirroring EF Core Entity Configurations. */
export const validateDetailsLimits = (details: Details): readonly string[] => {
  const violations: string[] = [];
  if (details.title.trim().length > FIELD_LIMITS.TITLE_MAX) {
    violations.push(`Title must not exceed ${String(FIELD_LIMITS.TITLE_MAX)} characters`);
  }
  if (details.subtitle.trim().length > FIELD_LIMITS.SUBTITLE_MAX) {
    violations.push(
      `Subtitle must not exceed ${String(FIELD_LIMITS.SUBTITLE_MAX)} characters`,
    );
  }
  if (details.description.length > FIELD_LIMITS.DESCRIPTION_MAX) {
    violations.push(
      `Description must not exceed ${String(FIELD_LIMITS.DESCRIPTION_MAX)} characters`,
    );
  }
  if (details.topic.trim().length > FIELD_LIMITS.TOPIC_MAX) {
    violations.push(`Topic must not exceed ${String(FIELD_LIMITS.TOPIC_MAX)} characters`);
  }
  if (details.language.trim().length > FIELD_LIMITS.LANGUAGE_MAX) {
    violations.push(
      `Language must not exceed ${String(FIELD_LIMITS.LANGUAGE_MAX)} characters`,
    );
  }
  if (details.keywords.trim().length > FIELD_LIMITS.KEYWORDS_MAX) {
    violations.push(
      `Keywords must not exceed ${String(FIELD_LIMITS.KEYWORDS_MAX)} characters`,
    );
  }
  if (details.thumbnailAlt.trim().length > FIELD_LIMITS.THUMBNAIL_ALT_MAX) {
    violations.push(
      `Thumbnail Alt must not exceed ${String(FIELD_LIMITS.THUMBNAIL_ALT_MAX)} characters`,
    );
  }
  if (details.tags.trim().length > 0) {
    const tags = details.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const longTags = tags.filter((t) => t.length > FIELD_LIMITS.TAG_MAX);
    if (longTags.length > 0) {
      violations.push(
        `Tags (${longTags.join(', ')}) must not exceed ${String(FIELD_LIMITS.TAG_MAX)} characters each`,
      );
    }
  }
  return violations;
};

/** Required fields that must be present and valid before publishing (used by the preview step). */
export const missingRequired = (details: Details): readonly string[] => {
  const missing: string[] = [];
  if (details.title.trim().length < FIELD_LIMITS.TITLE_MIN) {
    missing.push('Title (min 3 chars)');
  }
  if (isRichTextEmpty(details.description)) {
    missing.push('Description');
  }
  if (details.category.trim().length === 0) {
    missing.push('Category');
  }
  if (details.difficulty.trim().length === 0) {
    missing.push('Difficulty');
  }

  const boundaryErrors = validateDetailsLimits(details);
  missing.push(...boundaryErrors);

  return missing;
};
