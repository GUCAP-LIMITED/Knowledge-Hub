import type { ReactElement } from 'react';
import { Skeleton } from '@shared/ui';
import styles from './DynamicDashboard.module.css';

export const DashboardSkeletonGrid = (): ReactElement => (
  <div className={styles.skeletonGrid}>
    {[4, 4, 4, 6, 6].map((span, i) => (
      <div key={i} style={{ gridColumn: 'span ' + String(span), gridRow: 'span 2' }}>
        <Skeleton width="100%" height={180} />
      </div>
    ))}
  </div>
);
