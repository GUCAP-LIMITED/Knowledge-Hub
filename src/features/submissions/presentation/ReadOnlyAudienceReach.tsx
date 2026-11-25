import { useMemo, type ReactElement } from 'react';
import { Users } from 'lucide-react';
import { useUserScopeData, CONTENT_VISIBILITY } from '@features/content';
import {
  hydrateAudienceGroups,
  visibilityNumberToFormValue,
  EMPTY_DETAILS,
} from './upload-details';
import { buildAudienceSummary } from './audience-group-utils';

export interface ReadOnlyAudienceReachProps {
  readonly visibility: number;
  readonly branchIds?: readonly string[] | null | undefined;
  readonly teamIds?: readonly string[] | null | undefined;
}

export const ReadOnlyAudienceReach = ({
  visibility,
  branchIds,
  teamIds,
}: ReadOnlyAudienceReachProps): ReactElement => {
  const scopeQuery = useUserScopeData();
  const allBranches = useMemo(
    () => scopeQuery.data?.branches ?? [],
    [scopeQuery.data?.branches],
  );
  const allTeams = useMemo(() => scopeQuery.data?.teams ?? [], [scopeQuery.data?.teams]);

  const audienceGroups = useMemo(() => {
    const vis = visibilityNumberToFormValue(visibility);
    const branches = branchIds ? [...branchIds] : [];
    const teams = teamIds ? [...teamIds] : [];
    return hydrateAudienceGroups({
      ...EMPTY_DETAILS,
      visibility: visibility === CONTENT_VISIBILITY.public ? 'public' : vis,
      branches,
      teams,
    });
  }, [visibility, branchIds, teamIds]);

  const audienceSummary = useMemo(() => {
    const vis = visibilityNumberToFormValue(visibility);
    return buildAudienceSummary(audienceGroups, allBranches, allTeams, vis);
  }, [audienceGroups, allBranches, allTeams, visibility]);

  return (
    <div
      style={{
        padding: '1.25rem',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users size={16} style={{ color: 'var(--color-primary)' }} />
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Target Audience Reach
        </h4>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '0.95rem',
          color: 'var(--color-text)',
          fontWeight: 500,
        }}
      >
        {audienceSummary}
      </p>
    </div>
  );
};
