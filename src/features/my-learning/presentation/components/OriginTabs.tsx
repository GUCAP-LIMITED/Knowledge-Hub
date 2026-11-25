import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { MyLearningStats } from '../../domain/types';
import styles from '../MyLearningToolbar.module.css';

export interface OriginTabsProps {
  readonly origin: 'all' | 'self' | 'assigned';
  readonly onOriginChange: (value: 'all' | 'self' | 'assigned') => void;
  readonly stats: MyLearningStats | undefined;
}

export const OriginTabs = ({
  origin,
  onOriginChange,
  stats,
}: OriginTabsProps): ReactElement => (
  <div className={styles.originTabs}>
    <button
      type="button"
      className={cn(styles.originTab, origin === 'all' && styles.originTabActive)}
      onClick={() => {
        onOriginChange('all');
      }}
    >
      <span>All Items</span>
      {stats ? <span className={styles.tabCount}>{stats.totalCount}</span> : null}
    </button>

    <button
      type="button"
      className={cn(styles.originTab, origin === 'assigned' && styles.originTabActive)}
      onClick={() => {
        onOriginChange('assigned');
      }}
    >
      <span>Assigned</span>
      {stats ? <span className={styles.tabCount}>{stats.assignedCount}</span> : null}
    </button>

    <button
      type="button"
      className={cn(styles.originTab, origin === 'self' && styles.originTabActive)}
      onClick={() => {
        onOriginChange('self');
      }}
    >
      <span>Self-Enrolled</span>
      {stats ? <span className={styles.tabCount}>{stats.selfCount}</span> : null}
    </button>
  </div>
);
