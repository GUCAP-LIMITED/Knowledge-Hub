import type { ReactElement } from 'react';
import { cn, formatUserType } from '@shared/utils';
import type { CertificateRoleSummary } from '../domain';
import styles from './CertificatesPage.module.css';

export type FilterSelection =
  | { readonly type: 'all' }
  | { readonly type: 'me' }
  | { readonly type: 'role'; readonly userTypeId: string };

export interface CertRolePillsProps {
  readonly selection: FilterSelection;
  readonly allCount: number;
  readonly myCount: number;
  readonly roles: readonly CertificateRoleSummary[];
  readonly showAll: boolean;
  readonly onSelect: (selection: FilterSelection) => void;
}

/** Horizontal filter pills for certificates: All, For Me, and role-specific tabs. */
export const CertRolePills = ({
  selection,
  allCount,
  myCount,
  roles,
  showAll,
  onSelect,
}: CertRolePillsProps): ReactElement => (
  <div className={styles.pills} role="tablist" aria-label="Filter certificates">
    {showAll ? (
      <button
        type="button"
        role="tab"
        aria-selected={selection.type === 'all'}
        className={cn(styles.pill, selection.type === 'all' && styles.pillActive)}
        onClick={() => {
          onSelect({ type: 'all' });
        }}
      >
        All ({allCount})
      </button>
    ) : null}

    <button
      type="button"
      role="tab"
      aria-selected={selection.type === 'me'}
      className={cn(styles.pill, selection.type === 'me' && styles.pillActive)}
      onClick={() => {
        onSelect({ type: 'me' });
      }}
    >
      For Me ({myCount})
    </button>

    {roles.map((role) => {
      const isSelected =
        selection.type === 'role' && selection.userTypeId === role.userTypeId;
      return (
        <button
          key={role.userTypeId}
          type="button"
          role="tab"
          aria-selected={isSelected}
          className={cn(styles.pill, isSelected && styles.pillActive)}
          onClick={() => {
            onSelect({ type: 'role', userTypeId: role.userTypeId });
          }}
        >
          {formatUserType(role.roleName)} ({role.certificateCount})
        </button>
      );
    })}
  </div>
);
