import type { ReactElement } from 'react';
import {
  Building2,
  Globe,
  Lock,
  Trash2,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Badge, IconButton } from '@shared/ui';
import { formatUserType } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { DataAccessScope, UserType } from '../domain';
import styles from './UserTypesPage.module.css';

interface ScopeMeta {
  readonly label: string;
  readonly icon: LucideIcon;
}

const SCOPE_META: Readonly<Record<DataAccessScope, ScopeMeta>> = {
  0: { label: 'Self', icon: User },
  5: { label: 'Team', icon: Users },
  10: { label: 'Branch — all', icon: Building2 },
  15: { label: 'Full access', icon: Globe },
};

export interface UserTypeRowProps {
  readonly item: UserType;
  readonly onDelete: (item: UserType) => void;
}

const RowActions = ({ item, onDelete }: UserTypeRowProps): ReactElement | null => {
  const { can } = useMyCapabilities();
  if (item.isSeeded) {
    return (
      <span className={styles.readOnly}>
        <Lock size={13} aria-hidden /> Read-only
      </span>
    );
  }
  if (!can('user-types', 'delete')) {
    return null;
  }
  return (
    <IconButton
      label={`Delete ${formatUserType(item.name)}`}
      variant="danger"
      onClick={() => {
        onDelete(item);
      }}
    >
      <Trash2 size={16} aria-hidden />
    </IconButton>
  );
};

/** One row in the user-types management list. Seeded types are read-only (no delete). */
export const UserTypeRow = ({ item, onDelete }: UserTypeRowProps): ReactElement => {
  const scope = SCOPE_META[item.dataAccessScope];
  const ScopeIcon = scope.icon;

  return (
    <li className={styles.row}>
      <div className={styles.rowLead}>
        <span className={styles.rowIcon} title={`Data scope: ${scope.label}`}>
          <ScopeIcon size={18} aria-hidden />
        </span>
        <div className={styles.rowMain}>
          <span className={styles.rowName}>{formatUserType(item.name)}</span>
          {item.description !== null && item.description.trim() !== '' ? (
            <span className={styles.rowDescription}>{item.description}</span>
          ) : null}
          <span className={styles.rowMeta}>
            <Badge tone="info" size="sm">
              {scope.label}
            </Badge>
            {item.isRanked ? (
              <Badge tone="neutral" size="sm">
                Level {item.hierarchyLevel}
              </Badge>
            ) : null}
            {item.isAdmin ? (
              <Badge tone="primary" size="sm">
                Admin
              </Badge>
            ) : null}
            {item.isSeeded ? (
              <Badge tone="secondary" size="sm">
                Seeded
              </Badge>
            ) : null}
            {item.canLogin ? (
              <Badge tone="success" size="sm">
                Login: Allowed
              </Badge>
            ) : (
              <Badge tone="danger" size="sm">
                Login: Disallowed
              </Badge>
            )}
            <span className={styles.muted}>
              {item.roles.length} role{item.roles.length === 1 ? '' : 's'}
            </span>
          </span>
        </div>
      </div>
      <RowActions item={item} onDelete={onDelete} />
    </li>
  );
};
