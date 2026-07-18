import type { ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge, IconButton } from '@shared/ui';
import type { DataAccessScope, UserType } from '../domain';
import styles from './UserTypesPage.module.css';

function scopeLabel(scope: DataAccessScope): string {
  if (scope === 15) return 'Full access';
  if (scope === 10) return 'Branch — all';
  if (scope === 5) return 'Team';
  return 'Self';
}

export interface UserTypeRowProps {
  readonly item: UserType;
  readonly onDelete: (item: UserType) => void;
}

/** One row in the user-types management list. Seeded types are read-only (no delete). */
export const UserTypeRow = ({ item, onDelete }: UserTypeRowProps): ReactElement => (
  <li className={styles.row}>
    <div className={styles.rowMain}>
      <span className={styles.rowName}>{item.name}</span>
      <span className={styles.rowMeta}>
        <Badge tone="info" size="sm">
          {scopeLabel(item.dataAccessScope)}
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
        {!item.isActive ? (
          <Badge tone="warning" size="sm">
            Inactive
          </Badge>
        ) : null}
        <span className={styles.muted}>
          {item.roles.length} role{item.roles.length === 1 ? '' : 's'}
        </span>
      </span>
    </div>

    {item.isSeeded ? (
      <span className={styles.muted}>Read-only</span>
    ) : (
      <IconButton
        label={`Delete ${item.name}`}
        variant="danger"
        onClick={() => {
          onDelete(item);
        }}
      >
        <Trash2 size={16} aria-hidden />
      </IconButton>
    )}
  </li>
);
