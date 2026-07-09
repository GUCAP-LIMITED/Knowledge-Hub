import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './Avatar.module.css';

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return (parts[0] ?? '?').slice(0, 2).toUpperCase();
  }
  return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
};

export interface AvatarProps {
  readonly name: string;
  readonly size?: number;
  readonly online?: boolean;
}

/** Circular initials avatar with an optional online indicator. */
export const Avatar = ({ name, size = 40, online }: AvatarProps): ReactElement => (
  <div className={styles.wrap} style={{ width: size, height: size }}>
    <div className={styles.avatar} style={{ fontSize: size / 2.6 }} aria-hidden="true">
      {initialsOf(name)}
    </div>
    {online !== undefined ? (
      <span className={cn(styles.dot, online ? styles.on : styles.off)} />
    ) : null}
  </div>
);
