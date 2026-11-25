/* eslint-disable max-lines-per-function, complexity */
import { useEffect, useMemo, useCallback, useRef } from 'react';
import type { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  useUserScopeData,
  type AudienceGroupState,
  type BranchOption,
  type TeamOption,
} from '@features/content';
import { useAuth } from '@features/auth';
import { generateGuid } from '@shared/utils';
import {
  createDefaultAudienceGroup,
  compileAudienceGroups,
  type Details,
  type Visibility,
} from './upload-details';

const EMPTY_BRANCHES: readonly BranchOption[] = [];
const EMPTY_TEAMS: readonly TeamOption[] = [];

const areStringArraysEqual = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((val, idx) => val === b[idx]);

export interface UseAudienceManagerParams {
  readonly visibility?: Visibility | undefined;
  readonly audienceGroups?: readonly AudienceGroupState[] | undefined;
  readonly onVisibilityChange?: ((visibility: Visibility) => void) | undefined;
  readonly onAudienceGroupsChange?:
    | ((groups: readonly AudienceGroupState[]) => void)
    | undefined;
  readonly onCompiledChange?:
    | ((compiled: {
        branches: string[];
        teams: string[];
        visibility: Visibility;
      }) => void)
    | undefined;
  readonly watch?: UseFormWatch<Details> | undefined;
  readonly setValue?: UseFormSetValue<Details> | undefined;
  readonly disabled?: boolean | undefined;
}

export interface AudienceManagerResult {
  readonly visibility: Visibility;
  readonly audienceGroups: readonly AudienceGroupState[];
  readonly allBranches: readonly BranchOption[];
  readonly allTeams: readonly TeamOption[];
  readonly unassignedBranches: readonly BranchOption[];
  readonly canAddGroup: boolean;
  readonly hasAllBranchesGroup: boolean;
  readonly handleVisibilityChange: (newVis: Visibility) => void;
  readonly handleAddGroup: () => void;
  readonly handleUpdateGroup: (index: number, updated: AudienceGroupState) => void;
  readonly handleRemoveGroup: (index: number) => void;
}

export const useAudienceManager = ({
  visibility: controlledVisibility,
  audienceGroups: controlledAudienceGroups,
  onVisibilityChange,
  onAudienceGroupsChange,
  onCompiledChange,
  watch,
  setValue,
  disabled = false,
}: UseAudienceManagerParams): AudienceManagerResult => {
  const scopeQuery = useUserScopeData();
  const auth = useAuth();
  const activeBranchId = auth.user?.branchIds[0];

  const isFormMode = Boolean(watch && setValue);

  const formVisibility = watch
    ? (watch('visibility') as Visibility | undefined)
    : undefined;
  const visibility: Visibility = isFormMode
    ? (formVisibility ?? 'team')
    : (controlledVisibility ?? 'team');

  const formAudienceGroups = watch
    ? (watch('audienceGroups') as readonly AudienceGroupState[] | undefined)
    : undefined;
  const audienceGroups: readonly AudienceGroupState[] = useMemo(() => {
    if (isFormMode) {
      return formAudienceGroups ?? [];
    }
    return controlledAudienceGroups ?? [];
  }, [isFormMode, formAudienceGroups, controlledAudienceGroups]);

  const allBranches = useMemo(
    () => scopeQuery.data?.branches ?? EMPTY_BRANCHES,
    [scopeQuery.data?.branches],
  );

  const allTeams = useMemo(
    () => scopeQuery.data?.teams ?? EMPTY_TEAMS,
    [scopeQuery.data?.teams],
  );

  const onAudienceGroupsChangeRef = useRef(onAudienceGroupsChange);
  onAudienceGroupsChangeRef.current = onAudienceGroupsChange;

  const onCompiledChangeRef = useRef(onCompiledChange);
  onCompiledChangeRef.current = onCompiledChange;

  const prevCompiledRef = useRef<{
    branches: string[];
    teams: string[];
    visibility: Visibility;
  } | null>(null);

  // Keep initialized with a default group on initial load if none exist and not disabled
  useEffect(() => {
    if (!disabled && audienceGroups.length === 0) {
      const defaultGroup = [createDefaultAudienceGroup()];
      if (setValue) {
        setValue('audienceGroups', defaultGroup);
      }
      if (onAudienceGroupsChangeRef.current) {
        onAudienceGroupsChangeRef.current(defaultGroup);
      }
    }
  }, [audienceGroups.length, disabled, setValue]);

  // Keep compiled branches & teams in sync with audienceGroups with change detection
  useEffect(() => {
    const compiled = compileAudienceGroups(
      audienceGroups,
      visibility,
      allBranches,
      activeBranchId,
    );
    const prev = prevCompiledRef.current;
    const branchesMatch =
      prev !== null && areStringArraysEqual(prev.branches, compiled.branches);
    const teamsMatch = prev !== null && areStringArraysEqual(prev.teams, compiled.teams);
    const visMatch = prev !== null && prev.visibility === compiled.visibility;

    if (!branchesMatch || !teamsMatch || !visMatch) {
      prevCompiledRef.current = compiled;
      if (setValue) {
        setValue('branches', compiled.branches, { shouldDirty: true });
        setValue('teams', compiled.teams, { shouldDirty: true });
      }
      if (onCompiledChangeRef.current) {
        onCompiledChangeRef.current(compiled);
      }
    }
  }, [audienceGroups, visibility, allBranches, activeBranchId, setValue]);

  // Track all assigned branch IDs to enforce branch uniqueness across groups
  const allAssignedBranchIds = useMemo(() => {
    const set = new Set<string>();
    for (const group of audienceGroups) {
      if (!group.isAllBranches || group.branchIds.length > 0) {
        group.branchIds.forEach((bId) => {
          set.add(bId);
        });
      }
    }
    return set;
  }, [audienceGroups]);

  const hasAllBranchesGroup = audienceGroups.some(
    (g) =>
      (g.isAllBranches && g.branchIds.length === 0) ||
      (allBranches.length > 0 && g.branchIds.length >= allBranches.length),
  );

  const unassignedBranches = useMemo(
    () => allBranches.filter((b) => !allAssignedBranchIds.has(b.id)),
    [allBranches, allAssignedBranchIds],
  );

  const canAddGroup =
    !hasAllBranchesGroup && unassignedBranches.length > 0 && allBranches.length > 1;

  const handleVisibilityChange = useCallback(
    (newVis: Visibility): void => {
      if (disabled) return;
      if (setValue) {
        setValue('visibility', newVis, { shouldDirty: true, shouldValidate: true });
      }
      if (onVisibilityChange) {
        onVisibilityChange(newVis);
      }
    },
    [disabled, setValue, onVisibilityChange],
  );

  const handleAddGroup = useCallback((): void => {
    if (disabled || !canAddGroup) return;

    const initialBranchId = unassignedBranches[0]?.id;
    const newGroup: AudienceGroupState = {
      id: generateGuid(),
      isAllBranches: false,
      branchIds: initialBranchId ? [initialBranchId] : [],
      accessType: 'public',
      teamIds: [],
    };

    const nextGroups = [...audienceGroups, newGroup];
    if (setValue) {
      setValue('audienceGroups', nextGroups, { shouldDirty: true });
    }
    if (onAudienceGroupsChange) {
      onAudienceGroupsChange(nextGroups);
    }
  }, [
    disabled,
    canAddGroup,
    unassignedBranches,
    audienceGroups,
    setValue,
    onAudienceGroupsChange,
  ]);

  const handleUpdateGroup = useCallback(
    (index: number, updated: AudienceGroupState): void => {
      if (disabled) return;
      const nextGroups = [...audienceGroups];
      nextGroups[index] = updated;
      if (setValue) {
        setValue('audienceGroups', nextGroups, { shouldDirty: true });
      }
      if (onAudienceGroupsChange) {
        onAudienceGroupsChange(nextGroups);
      }
    },
    [disabled, audienceGroups, setValue, onAudienceGroupsChange],
  );

  const handleRemoveGroup = useCallback(
    (index: number): void => {
      if (disabled || audienceGroups.length <= 1) return;
      const nextGroups = audienceGroups.filter((_, i) => i !== index);
      if (setValue) {
        setValue('audienceGroups', nextGroups, { shouldDirty: true });
      }
      if (onAudienceGroupsChange) {
        onAudienceGroupsChange(nextGroups);
      }
    },
    [disabled, audienceGroups, setValue, onAudienceGroupsChange],
  );

  return {
    visibility,
    audienceGroups,
    allBranches,
    allTeams,
    unassignedBranches,
    canAddGroup,
    hasAllBranchesGroup,
    handleVisibilityChange,
    handleAddGroup,
    handleUpdateGroup,
    handleRemoveGroup,
  };
};
