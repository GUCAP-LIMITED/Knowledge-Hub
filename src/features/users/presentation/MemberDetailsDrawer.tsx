import type { ReactElement } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Building2, Mail, Shield, Users, X } from 'lucide-react';
import { Avatar, Badge, Button, IconButton } from '@shared/ui';
import type { BranchUser } from '../domain';
import { userDisplayName } from './user-display-name';
import styles from './MemberDetails.module.css';

export interface MemberDetailsDrawerProps {
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
  user.userTypes.length === 0 ? '—' : user.userTypes.map((type) => type.name).join(', ');

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

const Panel = ({
  user,
  isBusy,
  onEditPermissions,
  onToggleStatus,
}: {
  readonly user: BranchUser;
  readonly isBusy: boolean;
  readonly onEditPermissions: (user: BranchUser) => void;
  readonly onToggleStatus: (user: BranchUser) => void;
}): ReactElement => (
  <>
    <div className={styles.identity}>
      <Avatar name={userDisplayName(user)} size={72} online={user.isActive} />
      <Dialog.Title className={styles.name}>{userDisplayName(user)}</Dialog.Title>
      {user.userTypes.length > 0 ? (
        <div className={styles.typeBadges}>
          {user.userTypes.map((type) => (
            <Badge key={type.id} tone="info" size="sm">
              {type.name}
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
    <div className={styles.actions}>
      <Button
        onClick={() => {
          onEditPermissions(user);
        }}
      >
        <Shield size={15} aria-hidden="true" /> Edit permissions
      </Button>
      <Button
        variant="secondary"
        isLoading={isBusy}
        onClick={() => {
          onToggleStatus(user);
        }}
      >
        {user.isActive ? 'Block account' : 'Unblock account'}
      </Button>
    </div>
  </>
);

/** Right-hand sheet showing a member's details with entry points to edit permissions or block them. */
export const MemberDetailsDrawer = ({
  user,
  isBusy,
  onClose,
  onEditPermissions,
  onToggleStatus,
}: MemberDetailsDrawerProps): ReactElement => (
  <Dialog.Root
    open={user !== null}
    onOpenChange={(next) => {
      if (!next) onClose();
    }}
  >
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.drawer} aria-describedby={undefined}>
        <header className={styles.header}>
          <span className={styles.headerTitle}>Member details</span>
          <Dialog.Close asChild>
            <IconButton label="Close details">
              <X size={18} aria-hidden="true" />
            </IconButton>
          </Dialog.Close>
        </header>
        {user !== null ? (
          <Panel
            user={user}
            isBusy={isBusy}
            onEditPermissions={onEditPermissions}
            onToggleStatus={onToggleStatus}
          />
        ) : null}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
