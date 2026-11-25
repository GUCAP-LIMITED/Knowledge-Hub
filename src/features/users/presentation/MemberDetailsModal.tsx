import type { ReactElement } from 'react';
import { Building2, Mail, Shield, Users } from 'lucide-react';
import { Avatar, Badge, Button, Modal } from '@shared/ui';
import { formatUserType } from '@shared/utils';
import type { BranchUser } from '../domain';
import { userDisplayName } from './user-display-name';
import { useMyCapabilities } from './use-my-capabilities';
import styles from './MemberDetails.module.css';

export interface MemberDetailsModalProps {
  readonly user: BranchUser | null;
  readonly isBusy: boolean;
  readonly onClose: () => void;
  readonly onEditPermissions: (user: BranchUser) => void;
  readonly onToggleStatus: (user: BranchUser) => void;
}

const branchesLabel = (user: BranchUser): string =>
  user.branches.length === 0
    ? '—'
    : user.branches
        .map((branch) =>
          branch.isPrimary ? `${branch.branchName} (primary)` : branch.branchName,
        )
        .join(', ');

const typesLabel = (user: BranchUser): string =>
  user.userTypes.length === 0
    ? '—'
    : user.userTypes.map((type) => formatUserType(type.name)).join(', ');

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof Mail;
  readonly label: string;
  readonly value: string;
}): ReactElement => (
  <div className={styles.infoRow}>
    <span className={styles.infoIcon}>
      <Icon size={16} aria-hidden="true" />
    </span>
    <span className={styles.infoText}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </span>
  </div>
);

const MemberDetailsBody = ({ user }: { readonly user: BranchUser }): ReactElement => (
  <>
    <div className={styles.identity}>
      <Avatar name={userDisplayName(user)} size={72} online={user.isActive} />
      <span className={styles.name}>{userDisplayName(user)}</span>
      {user.userTypes.length > 0 ? (
        <div className={styles.typeBadges}>
          {user.userTypes.map((type) => (
            <Badge key={type.id} tone="info" size="sm">
              {formatUserType(type.name)}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
    <div className={styles.info}>
      <InfoRow icon={Mail} label="Email" value={user.email ?? '—'} />
      <InfoRow
        icon={Shield}
        label="Status"
        value={user.isActive ? 'Active' : 'Blocked'}
      />
      <InfoRow icon={Building2} label="Branches" value={branchesLabel(user)} />
      <InfoRow icon={Users} label="User types" value={typesLabel(user)} />
    </div>
  </>
);

const MemberDetailsFooter = ({
  user,
  isBusy,
  onEditPermissions,
  onToggleStatus,
}: {
  readonly user: BranchUser;
  readonly isBusy: boolean;
  readonly onEditPermissions: (user: BranchUser) => void;
  readonly onToggleStatus: (user: BranchUser) => void;
}): ReactElement => {
  const { can } = useMyCapabilities();
  return (
    <>
      {can('users', 'deactivate') ? (
        <Button
          variant="outline"
          isLoading={isBusy}
          onClick={() => {
            onToggleStatus(user);
          }}
        >
          {user.isActive ? 'Block account' : 'Unblock account'}
        </Button>
      ) : null}
      {can('users', 'changePermissions') ? (
        <Button
          onClick={() => {
            onEditPermissions(user);
          }}
        >
          <Shield size={15} aria-hidden="true" /> Edit permissions
        </Button>
      ) : null}
    </>
  );
};

/** Centered modal showing a member's details, with entry points to edit permissions or block them. */
export const MemberDetailsModal = ({
  user,
  isBusy,
  onClose,
  onEditPermissions,
  onToggleStatus,
}: MemberDetailsModalProps): ReactElement => (
  <Modal
    open={user !== null}
    onOpenChange={(next) => {
      if (!next) onClose();
    }}
    title="Member details"
    footer={
      user !== null ? (
        <MemberDetailsFooter
          user={user}
          isBusy={isBusy}
          onEditPermissions={onEditPermissions}
          onToggleStatus={onToggleStatus}
        />
      ) : undefined
    }
  >
    {user !== null ? <MemberDetailsBody user={user} /> : null}
  </Modal>
);
