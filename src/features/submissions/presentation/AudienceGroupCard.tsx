/* eslint-disable max-lines-per-function, complexity */
import { useMemo, type ReactElement } from 'react';
import { Trash2, Users, Building2, Globe } from 'lucide-react';
import { Button, MultiSelect, type MultiSelectOption } from '@shared/ui';
import type { AudienceGroupState, BranchOption, TeamOption } from '@features/content';
import { mapTeamOptions, getAudienceGroupSummaries } from './audience-group-utils';
import styles from './UploadPage.module.css';

export interface AudienceGroupCardProps {
  readonly group: AudienceGroupState;
  readonly index: number;
  readonly isOnlyGroup: boolean;
  readonly allBranches: readonly BranchOption[];
  readonly allTeams: readonly TeamOption[];
  readonly otherAssignedBranchIds: ReadonlySet<string>;
  readonly onChange: (updated: AudienceGroupState) => void;
  readonly onRemove: () => void;
  readonly disabled?: boolean;
}

export const AudienceGroupCard = ({
  group,
  index,
  isOnlyGroup,
  allBranches,
  allTeams,
  otherAssignedBranchIds,
  onChange,
  onRemove,
  disabled = false,
}: AudienceGroupCardProps): ReactElement => {
  const availableBranches = useMemo(
    () =>
      allBranches.filter(
        (b) => group.branchIds.includes(b.id) || !otherAssignedBranchIds.has(b.id),
      ),
    [allBranches, group.branchIds, otherAssignedBranchIds],
  );

  const branchOptions: MultiSelectOption[] = useMemo(
    () => availableBranches.map((b) => ({ value: b.id, label: b.name })),
    [availableBranches],
  );

  const teamOptions = useMemo(() => mapTeamOptions(allTeams), [allTeams]);

  const handleBranchesChange = (selected: readonly string[]): void => {
    onChange({
      ...group,
      isAllBranches: false,
      branchIds: selected,
    });
  };

  const handleAccessTypeChange = (accessType: 'public' | 'teams'): void => {
    onChange({
      ...group,
      accessType,
      teamIds:
        accessType === 'teams' && group.teamIds.length === 0
          ? allTeams.map((t) => t.id)
          : group.teamIds,
    });
  };

  const { branchSummary, accessSummary } = getAudienceGroupSummaries(
    group,
    allBranches.length,
  );
  const accessRadioName = ['access-type', group.id].join('-');
  const branchScopeRadioName = ['branch-scope', group.id].join('-');

  return (
    <div className={styles.audienceGroupCard}>
      <div className={styles.audienceGroupHead}>
        <div className={styles.audienceGroupTitle}>
          <span className={styles.groupBadge}>Group {String(index + 1)}</span>
          <span className={styles.groupSubtitle}>
            {branchSummary} · {accessSummary}
          </span>
        </div>
        {!isOnlyGroup && !disabled && (
          <Button
            variant="ghost"
            size="xs"
            className={styles.removeGroupBtn}
            onClick={() => {
              onRemove();
            }}
            title="Remove this audience group"
          >
            <Trash2 aria-hidden="true" />
            <span>Remove</span>
          </Button>
        )}
      </div>

      <div className={styles.audienceGroupBody}>
        {/* Target Branches Scoping */}
        <div className={styles.groupField}>
          <div className={styles.fieldLabelRow}>
            <Building2 size={15} className={styles.fieldIcon} />
            <span className={styles.fieldLabel}>Target Branches</span>
          </div>

          {isOnlyGroup && (
            <div className={styles.branchModeToggle} style={{ marginBottom: '0.6rem' }}>
              <label className={styles.radioPill}>
                <input
                  type="radio"
                  name={branchScopeRadioName}
                  value="all"
                  checked={group.isAllBranches}
                  disabled={disabled}
                  onChange={() => {
                    onChange({
                      ...group,
                      isAllBranches: true,
                      branchIds: [],
                    });
                  }}
                />
                <span>All Branches (Organization-wide)</span>
              </label>

              <label className={styles.radioPill}>
                <input
                  type="radio"
                  name={branchScopeRadioName}
                  value="specific"
                  checked={!group.isAllBranches}
                  disabled={disabled}
                  onChange={() => {
                    onChange({
                      ...group,
                      isAllBranches: false,
                      branchIds:
                        group.branchIds.length > 0
                          ? group.branchIds
                          : availableBranches.map((b) => b.id),
                    });
                  }}
                />
                <span>Specific Branches</span>
              </label>
            </div>
          )}

          {group.isAllBranches ? (
            <div className={styles.allBranchesNotice}>
              <Globe size={16} />
              <span>
                Organization-wide: All learners across all branches can access this
                content.
              </span>
            </div>
          ) : (
            <MultiSelect
              label=""
              placeholder={
                branchOptions.length === 0
                  ? 'No remaining unassigned branches'
                  : 'Select target branches…'
              }
              options={branchOptions}
              value={group.branchIds}
              onChange={handleBranchesChange}
              selectAllLabel="Select All Accessible Branches"
              disabled={disabled}
            />
          )}
        </div>

        {/* Access Level and Common Teams */}
        <div className={styles.groupField}>
          <div className={styles.fieldLabelRow}>
            <Users size={15} className={styles.fieldIcon} />
            <span className={styles.fieldLabel}>
              Access Level within Selected Branch(es)
            </span>
          </div>

          <div className={styles.accessTypeGrid}>
            <label
              className={[
                styles.accessTypeOption,
                group.accessType === 'public' ? styles.accessTypeOptionActive : null,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="radio"
                name={accessRadioName}
                value="public"
                checked={group.accessType === 'public'}
                disabled={disabled}
                onChange={() => {
                  handleAccessTypeChange('public');
                }}
              />
              <div>
                <span className={styles.accessTypeTitle}>
                  Everyone in branch(es) (Public)
                </span>
                <span className={styles.accessTypeDesc}>
                  All enrolled members in the selected branch(es) can access this content.
                </span>
              </div>
            </label>

            <label
              className={[
                styles.accessTypeOption,
                group.accessType === 'teams' ? styles.accessTypeOptionActive : null,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="radio"
                name={accessRadioName}
                value="teams"
                checked={group.accessType === 'teams'}
                disabled={disabled}
                onChange={() => {
                  handleAccessTypeChange('teams');
                }}
              />
              <div>
                <span className={styles.accessTypeTitle}>Specific Teams</span>
                <span className={styles.accessTypeDesc}>
                  Restrict access to designated teams located in these branch(es).
                </span>
              </div>
            </label>
          </div>

          {group.accessType === 'teams' && (
            <div style={{ marginTop: '0.75rem' }}>
              <MultiSelect
                label="Target Teams"
                placeholder={
                  allTeams.length === 0 ? 'No teams available' : 'Select target teams…'
                }
                options={teamOptions}
                value={group.teamIds}
                onChange={(selected) => {
                  onChange({ ...group, teamIds: selected });
                }}
                allLabel="All Teams"
                selectAllLabel="Select All Teams"
                disabled={disabled || allTeams.length === 0}
              />
              {allTeams.length === 0 && (
                <p className={styles.emptyTeamsNotice}>
                  No user teams currently exist. Access will be limited to direct
                  managers.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
