import type { ReactElement } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge, IconButton } from '@shared/ui';
import type { Team } from '../domain';
import styles from './TeamsPage.module.css';

export interface TeamRowProps {
  readonly team: Team;
  readonly onEdit: (team: Team) => void;
  readonly onDelete: (team: Team) => void;
}

/** One row in the teams management list: name + member badges + edit/delete actions. */
export const TeamRow = ({ team, onEdit, onDelete }: TeamRowProps): ReactElement => (
  <li className={styles.row}>
    <div className={styles.rowMain}>
      <span className={styles.rowName}>{team.name}</span>
      <span className={styles.rowMeta}>
        {team.members.length === 0 ? (
          <span className={styles.muted}>No members</span>
        ) : (
          team.members.map((member) => (
            <Badge key={member.userTypeId} tone="info" size="sm">
              {member.userTypeName ?? 'Unknown'}
            </Badge>
          ))
        )}
      </span>
    </div>

    <div className={styles.rowActions}>
      <IconButton
        label={`Edit ${team.name}`}
        onClick={() => {
          onEdit(team);
        }}
      >
        <Pencil size={16} aria-hidden />
      </IconButton>
      <IconButton
        label={`Delete ${team.name}`}
        variant="danger"
        onClick={() => {
          onDelete(team);
        }}
      >
        <Trash2 size={16} aria-hidden />
      </IconButton>
    </div>
  </li>
);
