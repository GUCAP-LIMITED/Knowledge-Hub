/* eslint-disable max-lines-per-function */
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactElement,
} from 'react';
import { Button } from '@shared/ui';
import {
  type ContentDetail,
  type AudienceGroupState,
  CONTENT_VISIBILITY,
} from '@features/content';
import { useDraftEditor } from './use-draft-editor';
import { AudienceSection } from './AudienceSection';
import { SettingsDangerZone } from './SettingsDangerZone';
import {
  EMPTY_DETAILS,
  hydrateAudienceGroups,
  visibilityNumberToFormValue,
  compiledVisibilityToNumber,
  type Visibility,
} from './upload-details';

const areArraysEqual = (
  a: readonly string[] | null | undefined,
  b: readonly string[] | null | undefined,
): boolean => {
  const arrA = a ?? [];
  const arrB = b ?? [];
  if (arrA.length !== arrB.length) return false;
  return arrA.every((val, idx) => val === arrB[idx]);
};

export interface SettingsTabProps {
  readonly content: ContentDetail;
  readonly readOnly?: boolean;
}

export const SettingsTab = ({
  content,
  readOnly = false,
}: SettingsTabProps): ReactElement => {
  const { draftState, updateDetails, saveDraft, isSaving, contentTypeKey } =
    useDraftEditor();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const contentTypeName =
    contentTypeKey === 'tutorial'
      ? 'Tutorial'
      : contentTypeKey === 'resource'
        ? 'Resource'
        : 'Course';

  const initialVisibility: Visibility = useMemo(
    () => visibilityNumberToFormValue(draftState.details.visibility),
    [draftState.details.visibility],
  );

  const initialBranches = useMemo(
    () => (draftState.details.branchIds ? [...draftState.details.branchIds] : []),
    [draftState.details.branchIds],
  );

  const initialTeams = useMemo(
    () => (draftState.details.teamIds ? [...draftState.details.teamIds] : []),
    [draftState.details.teamIds],
  );

  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [audienceGroups, setAudienceGroups] = useState<readonly AudienceGroupState[]>(
    () =>
      hydrateAudienceGroups({
        ...EMPTY_DETAILS,
        visibility:
          draftState.details.visibility === CONTENT_VISIBILITY.public
            ? 'public'
            : initialVisibility,
        branches: initialBranches,
        teams: initialTeams,
      }),
  );

  const [compiled, setCompiled] = useState<{
    branches: string[];
    teams: string[];
    visibility: Visibility;
  }>(() => ({
    branches: initialBranches,
    teams: initialTeams,
    visibility:
      draftState.details.visibility === CONTENT_VISIBILITY.public
        ? 'public'
        : initialVisibility,
  }));

  // Tracks what was last synced to draftState from this tab, preventing self-triggered re-hydration loops
  const lastSyncedRef = useRef<{
    visibility: number;
    branchIds: readonly string[];
    teamIds: readonly string[];
  }>({
    visibility: draftState.details.visibility,
    branchIds: initialBranches,
    teamIds: initialTeams,
  });

  // Tracks the baseline saved settings state to determine whether unsaved changes exist
  const initialSavedSettingsRef = useRef<{
    visibility: number;
    branchIds: readonly string[];
    teamIds: readonly string[];
  }>({
    visibility: draftState.details.visibility,
    branchIds: initialBranches,
    teamIds: initialTeams,
  });

  // Sync if draft state changes externally (e.g. active revision loaded from server)
  useEffect(() => {
    const curBranches = draftState.details.branchIds ?? [];
    const curTeams = draftState.details.teamIds ?? [];
    const last = lastSyncedRef.current;

    const branchesMatch = areArraysEqual(curBranches, last.branchIds);
    const teamsMatch = areArraysEqual(curTeams, last.teamIds);
    const visMatch = draftState.details.visibility === last.visibility;

    // If draftState details match what was last synced by this tab, ignore (not external)
    if (branchesMatch && teamsMatch && visMatch) {
      return;
    }

    const vis = visibilityNumberToFormValue(draftState.details.visibility);
    const branches = [...curBranches];
    const teams = [...curTeams];

    lastSyncedRef.current = {
      visibility: draftState.details.visibility,
      branchIds: branches,
      teamIds: teams,
    };
    initialSavedSettingsRef.current = {
      visibility: draftState.details.visibility,
      branchIds: branches,
      teamIds: teams,
    };

    setVisibility(vis);
    setAudienceGroups(
      hydrateAudienceGroups({
        ...EMPTY_DETAILS,
        visibility:
          draftState.details.visibility === CONTENT_VISIBILITY.public ? 'public' : vis,
        branches,
        teams,
      }),
    );
  }, [
    draftState.details.visibility,
    draftState.details.branchIds,
    draftState.details.teamIds,
  ]);

  const handleCompiledChange = useCallback(
    (nextCompiled: {
      branches: string[];
      teams: string[];
      visibility: Visibility;
    }): void => {
      setCompiled(nextCompiled);
      if (readOnly) return;

      const visNumber = compiledVisibilityToNumber(nextCompiled.visibility);
      const branches = nextCompiled.branches.length > 0 ? nextCompiled.branches : [];
      const teams = nextCompiled.teams.length > 0 ? nextCompiled.teams : null;

      const curBranches = draftState.details.branchIds ?? [];
      const curTeams = draftState.details.teamIds ?? [];

      const branchesMatch = areArraysEqual(branches, curBranches);
      const teamsMatch = areArraysEqual(teams, curTeams);
      const visMatch = draftState.details.visibility === visNumber;

      if (!branchesMatch || !teamsMatch || !visMatch) {
        lastSyncedRef.current = {
          visibility: visNumber,
          branchIds: branches,
          teamIds: teams ?? [],
        };
        updateDetails({
          visibility: visNumber,
          branchIds: branches,
          teamIds: teams,
        });
      }
    },
    [
      readOnly,
      draftState.details.visibility,
      draftState.details.branchIds,
      draftState.details.teamIds,
      updateDetails,
    ],
  );

  const isDirty = useMemo(() => {
    const saved = initialSavedSettingsRef.current;
    const currentVisNum = compiledVisibilityToNumber(compiled.visibility);
    if (currentVisNum !== saved.visibility) return true;

    if (compiled.branches.length !== saved.branchIds.length) return true;
    const savedBranchSet = new Set(saved.branchIds);
    if (!compiled.branches.every((b) => savedBranchSet.has(b))) return true;

    if (compiled.teams.length !== saved.teamIds.length) return true;
    const savedTeamSet = new Set(saved.teamIds);
    if (!compiled.teams.every((t) => savedTeamSet.has(t))) return true;

    return false;
  }, [compiled]);

  const handleSaveSettings = async (): Promise<void> => {
    const visNumber = compiledVisibilityToNumber(compiled.visibility);
    const branches = compiled.branches.length > 0 ? compiled.branches : [];
    const teams = compiled.teams.length > 0 ? compiled.teams : null;
    const updatedDetails = {
      ...draftState.details,
      visibility: visNumber,
      branchIds: branches,
      teamIds: teams,
    };
    lastSyncedRef.current = {
      visibility: visNumber,
      branchIds: branches,
      teamIds: teams ?? [],
    };
    updateDetails(updatedDetails);
    await saveDraft({
      ...draftState,
      details: updatedDetails,
    });
    initialSavedSettingsRef.current = {
      visibility: visNumber,
      branchIds: [...branches],
      teamIds: teams ? [...teams] : [],
    };
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {contentTypeName} Visibility
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Control who can see and access this {contentTypeKey}.
            </p>
          </div>

          {!readOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {saveSuccess && (
                <span
                  style={{
                    color: 'var(--color-success, #10b981)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Settings saved!
                </span>
              )}
              <Button
                type="button"
                variant="default"
                disabled={!isDirty || isSaving}
                onClick={() => {
                  void handleSaveSettings();
                }}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          )}
        </div>

        <AudienceSection
          visibility={visibility}
          audienceGroups={audienceGroups}
          onVisibilityChange={setVisibility}
          onAudienceGroupsChange={setAudienceGroups}
          onCompiledChange={handleCompiledChange}
          hideSectionWrapper={true}
          disabled={readOnly}
        />
      </div>

      {!readOnly && (
        <SettingsDangerZone
          content={content}
          contentTypeKey={contentTypeKey}
          contentTypeName={contentTypeName}
        />
      )}
    </div>
  );
};
