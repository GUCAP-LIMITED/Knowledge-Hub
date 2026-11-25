/* eslint-disable max-lines-per-function, complexity */
import { useMemo, type ReactElement } from 'react';
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Users, Plus, Eye, Lock } from 'lucide-react';
import type { AudienceGroupState } from '@features/content';
import { VISIBILITY_OPTIONS, type Details, type Visibility } from './upload-details';
import { Button } from '@shared/ui';
import { AudienceGroupCard } from './AudienceGroupCard';
import { DetailsSection } from './UploadDetailsSections';
import { buildAudienceSummary } from './audience-group-utils';
import { useAudienceManager } from './use-audience-manager';
import styles from './UploadPage.module.css';

export interface AudienceSectionProps {
  readonly visibility?: Visibility;
  readonly audienceGroups?: readonly AudienceGroupState[];
  readonly onVisibilityChange?: (visibility: Visibility) => void;
  readonly onAudienceGroupsChange?: (groups: readonly AudienceGroupState[]) => void;
  readonly onCompiledChange?: (compiled: {
    branches: string[];
    teams: string[];
    visibility: Visibility;
  }) => void;
  readonly branchErrorMessage?: string;

  readonly control?: Control<Details>;
  readonly watch?: UseFormWatch<Details>;
  readonly setValue?: UseFormSetValue<Details>;
  readonly register?: UseFormRegister<Details>;
  readonly errors?: FieldErrors<Details>;

  readonly title?: string;
  readonly icon?: typeof Users;
  readonly hideSectionWrapper?: boolean;
  readonly disabled?: boolean;
}

export const AudienceSection = (props: AudienceSectionProps): ReactElement => {
  const {
    branchErrorMessage,
    errors,
    title = 'Audience & Visibility',
    icon: Icon = Users,
    hideSectionWrapper = false,
    disabled = false,
  } = props;

  const {
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
  } = useAudienceManager(props);

  const summaryText = useMemo(
    () => buildAudienceSummary(audienceGroups, allBranches, allTeams, visibility),
    [allBranches, allTeams, audienceGroups, visibility],
  );

  const branchError = branchErrorMessage ?? errors?.branches?.message;

  const formBody = (
    <div className={styles.form}>
      {/* Top-Level Visibility Radio Cards */}
      <div className={styles.visList}>
        {VISIBILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={[
              styles.visOption,
              visibility === option.value ? styles.visOptionActive : null,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              value={option.value}
              checked={visibility === option.value}
              disabled={disabled}
              onChange={() => {
                handleVisibilityChange(option.value);
              }}
            />
            <span>
              <span className={styles.visTitle}>{option.title}</span>
              <span className={styles.visDesc}>{option.desc}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Private Mode Notice */}
      {visibility === 'private' && (
        <div className={styles.privateNoticeBanner}>
          <Lock size={18} style={{ color: 'var(--color-text-subtle)' }} />
          <div>
            <div className={styles.privateNoticeTitle}>Private Access Mode</div>
            <div className={styles.privateNoticeText}>
              No branch or team restrictions apply. The system will automatically record
              your active branch assignment.
            </div>
          </div>
        </div>
      )}

      {/* Targeted Multi-Group Audience Builder */}
      {visibility !== 'private' && (
        <div className={styles.audienceGroupsContainer}>
          {audienceGroups.map((group, index) => {
            const otherAssignedBranchIds = new Set<string>();
            audienceGroups.forEach((g, i) => {
              if (i !== index && !g.isAllBranches) {
                g.branchIds.forEach((bId) => {
                  otherAssignedBranchIds.add(bId);
                });
              }
            });

            return (
              <AudienceGroupCard
                key={group.id}
                group={group}
                index={index}
                isOnlyGroup={audienceGroups.length === 1}
                allBranches={allBranches}
                allTeams={allTeams}
                otherAssignedBranchIds={otherAssignedBranchIds}
                disabled={disabled}
                onChange={(updated) => {
                  handleUpdateGroup(index, updated);
                }}
                onRemove={() => {
                  handleRemoveGroup(index);
                }}
              />
            );
          })}

          {/* Add Group Action */}
          {!disabled && (
            <Button
              variant="outline"
              fullWidth
              onClick={handleAddGroup}
              disabled={!canAddGroup}
              title={
                hasAllBranchesGroup
                  ? 'Cannot add more groups while "All Branches" is selected'
                  : unassignedBranches.length === 0
                    ? 'All accessible branches are already assigned to groups'
                    : 'Add another audience group'
              }
            >
              <Plus aria-hidden="true" />
              <span>Add Another Audience Group</span>
            </Button>
          )}

          {/* Real-Time Reach Summary */}
          <div className={styles.audienceSummaryCard}>
            <Eye size={17} className={styles.summaryIcon} />
            <div className={styles.summaryContent}>
              <span className={styles.summaryTitle}>Target Audience Reach</span>
              <span className={styles.summaryText}>{summaryText}</span>
            </div>
          </div>

          {branchError && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', margin: 0 }}>
              {branchError}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (hideSectionWrapper) {
    return formBody;
  }

  return (
    <DetailsSection icon={Icon} title={title}>
      {formBody}
    </DetailsSection>
  );
};
