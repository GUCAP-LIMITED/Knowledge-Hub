import type { ReactElement } from 'react';
import { Lock } from 'lucide-react';
import { cn, formatUserType } from '@shared/utils';
import type { UserType } from '../domain';
import styles from './UserTypesPage.module.css';

export interface CreatePositionNoticeProps {
  readonly selectedNodeName: string | null;
  readonly attemptedSubmit: boolean;
}

export const CreatePositionNotice = ({
  selectedNodeName,
  attemptedSubmit,
}: CreatePositionNoticeProps): ReactElement => (
  <div className={styles.fieldGroup}>
    <span className={styles.fieldLabel}>
      Insert Position in Hierarchy<span className={styles.requiredStar}>*</span>
    </span>
    {selectedNodeName !== null ? (
      <div className={cn(styles.positionNotice, styles.positionNoticeSelected)}>
        Reports to: {formatUserType(selectedNodeName)}
      </div>
    ) : (
      <div className={cn(styles.positionNotice, styles.positionNoticeEmpty)}>
        Click an insert position on the hierarchy on the right
      </div>
    )}
    {attemptedSubmit && selectedNodeName === null ? (
      <span className={styles.counterError}>
        Please select an insert position in the hierarchy
      </span>
    ) : null}
  </div>
);

export interface EditPositionNoticeProps {
  readonly isApexRole: boolean;
  readonly selectedNodeName: string | null;
  readonly currentReportsTo?: string | null | undefined;
  readonly hierarchyLevel: number;
  readonly onRevertPosition?: (() => void) | undefined;
}

export const EditPositionNotice = ({
  isApexRole,
  selectedNodeName,
  currentReportsTo,
  hierarchyLevel,
  onRevertPosition,
}: EditPositionNoticeProps): ReactElement => {
  if (isApexRole) {
    return (
      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>Position in Hierarchy</span>
        <div className={cn(styles.positionNotice, styles.positionNoticeFixed)}>
          <Lock size={13} aria-hidden /> Top of Hierarchy (Fixed)
        </div>
        <span className={styles.nameDisabledHelp}>
          The uppermost role anchors the hierarchy and cannot be repositioned.
        </span>
      </div>
    );
  }

  if (selectedNodeName !== null) {
    return (
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelRow}>
          <span className={styles.fieldLabel}>Position in Hierarchy</span>
          {onRevertPosition !== undefined ? (
            <button
              type="button"
              onClick={onRevertPosition}
              className={styles.revertPositionBtn}
            >
              Revert position
            </button>
          ) : null}
        </div>
        <div className={cn(styles.positionNotice, styles.positionNoticeSelected)}>
          Move to: Reports to {formatUserType(selectedNodeName)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>Position in Hierarchy</span>
      <div className={cn(styles.positionNotice, styles.positionNoticeEmpty)}>
        Current: Level {String(hierarchyLevel)} •{' '}
        {typeof currentReportsTo === 'string'
          ? formatUserType(currentReportsTo)
          : 'Top of Hierarchy'}
      </div>
      <span className={styles.nameDisabledHelp}>
        To move this role, click an insert position on the hierarchy on the right.
      </span>
    </div>
  );
};

export interface PositionNoticeProps {
  readonly editTarget?: UserType | null | undefined;
  readonly isApexRole: boolean;
  readonly selectedNodeName: string | null;
  readonly currentReportsTo?: string | null | undefined;
  readonly attemptedSubmit: boolean;
  readonly onRevertPosition?: (() => void) | undefined;
}

export const PositionNotice = ({
  editTarget,
  isApexRole,
  selectedNodeName,
  currentReportsTo,
  attemptedSubmit,
  onRevertPosition,
}: PositionNoticeProps): ReactElement => {
  if (editTarget !== undefined && editTarget !== null) {
    return (
      <EditPositionNotice
        isApexRole={isApexRole}
        selectedNodeName={selectedNodeName}
        currentReportsTo={currentReportsTo}
        hierarchyLevel={editTarget.hierarchyLevel}
        onRevertPosition={onRevertPosition}
      />
    );
  }

  return (
    <CreatePositionNotice
      selectedNodeName={selectedNodeName}
      attemptedSubmit={attemptedSubmit}
    />
  );
};
