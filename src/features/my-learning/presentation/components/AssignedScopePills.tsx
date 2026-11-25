import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { MyLearningStats } from '../../domain/types';
import styles from '../MyLearningToolbar.module.css';

export interface AssignedScopePillsProps {
  readonly assignedScope: 'all' | 'me' | 'team' | 'role';
  readonly onAssignedScopeChange: (value: 'all' | 'me' | 'team' | 'role') => void;
  readonly stats: MyLearningStats | undefined;
}

export const AssignedScopePills = ({
  assignedScope,
  onAssignedScopeChange,
  stats,
}: AssignedScopePillsProps): ReactElement => (
  <div className={styles.assignedScopesRow}>
    <button
      type="button"
      className={cn(styles.scopePill, assignedScope === 'all' && styles.scopePillActive)}
      onClick={() => {
        onAssignedScopeChange('all');
      }}
    >
      <span>All</span>
    </button>
    <button
      type="button"
      className={cn(styles.scopePill, assignedScope === 'me' && styles.scopePillActive)}
      onClick={() => {
        onAssignedScopeChange('me');
      }}
    >
      <span>Direct to Me</span>
      {stats?.assignedMeCount ? (
        <span className={styles.scopeCount}>({stats.assignedMeCount})</span>
      ) : null}
    </button>
    <button
      type="button"
      className={cn(styles.scopePill, assignedScope === 'team' && styles.scopePillActive)}
      onClick={() => {
        onAssignedScopeChange('team');
      }}
    >
      <span>My Team</span>
      {stats?.assignedTeamCount ? (
        <span className={styles.scopeCount}>({stats.assignedTeamCount})</span>
      ) : null}
    </button>
    <button
      type="button"
      className={cn(styles.scopePill, assignedScope === 'role' && styles.scopePillActive)}
      onClick={() => {
        onAssignedScopeChange('role');
      }}
    >
      <span>My Role</span>
      {stats?.assignedRoleCount ? (
        <span className={styles.scopeCount}>({stats.assignedRoleCount})</span>
      ) : null}
    </button>
  </div>
);
