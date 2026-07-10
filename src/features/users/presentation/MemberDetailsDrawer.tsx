import type { ReactElement } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Calendar, Clock, Mail, Shield, X } from 'lucide-react';
import { Avatar, Badge, Button, IconButton, type BadgeTone } from '@shared/ui';
import type { UserAccount, UserRole } from '../domain';
import styles from './MemberDetails.module.css';

const ROLE_TONE: Record<UserRole, BadgeTone> = {
  admin: 'danger',
  manager: 'info',
  consultant: 'primary',
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  consultant: 'Consultant',
};

export interface MemberDetailsDrawerProps {
  readonly user: UserAccount | null;
  readonly isBusy: boolean;
  readonly onClose: () => void;
  readonly onEditPermissions: (user: UserAccount) => void;
  readonly onToggleStatus: (user: UserAccount) => void;
}

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
  readonly user: UserAccount;
  readonly isBusy: boolean;
  readonly onEditPermissions: (user: UserAccount) => void;
  readonly onToggleStatus: (user: UserAccount) => void;
}): ReactElement => {
  const active = user.isActive();
  return (
    <>
      <div className={styles.identity}>
        <Avatar name={user.name} size={72} online={active} />
        <Dialog.Title className={styles.name}>{user.name}</Dialog.Title>
        <Badge tone={ROLE_TONE[user.role]} icon={Shield}>
          {ROLE_LABEL[user.role]}
        </Badge>
      </div>
      <div className={styles.info}>
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow icon={Shield} label="Status" value={active ? 'Active' : 'Inactive'} />
        <InfoRow icon={Calendar} label="Joined" value={user.joined} />
        <InfoRow icon={Clock} label="Last active" value={user.lastActive} />
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
          {active ? 'Deactivate account' : 'Activate account'}
        </Button>
      </div>
    </>
  );
};

/** Right-hand sheet showing a member's details with entry points to edit permissions or status. */
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
      if (!next) {
        onClose();
      }
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
