import type { ReactElement } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  readonly width?: string | number;
  readonly height?: number;
  readonly radius?: number;
}

/** Shimmering placeholder for loading content. */
export const Skeleton = ({
  width = '100%',
  height = 16,
  radius = 6,
}: SkeletonProps): ReactElement => (
  <span className={styles.skeleton} style={{ width, height, borderRadius: radius }} />
);
