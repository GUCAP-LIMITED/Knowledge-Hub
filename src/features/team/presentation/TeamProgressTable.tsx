import { useEffect, useRef, type ReactElement } from 'react';
import { Loader2 } from 'lucide-react';
import { Avatar, Badge, ProgressBar } from '@shared/ui';
import { cn } from '@shared/utils';
import type { TeamMember } from '../domain';
import styles from './TeamProgressPage.module.css';

const HEADERS = ['Member', 'Role', 'Progress', 'Courses', 'Last Active'] as const;

const MemberRow = ({ member }: { readonly member: TeamMember }): ReactElement => (
  <tr className={styles.row}>
    <td className={styles.cell} data-label="Member">
      <div className={styles.member}>
        <Avatar name={member.name} size={36} online={member.status === 'online'} />
        <div className={styles.memberText}>
          <div className={styles.name}>{member.name}</div>
          <div className={styles.email}>{member.email}</div>
        </div>
      </div>
    </td>
    <td className={styles.cell} data-label="Role">
      <Badge>{member.role}</Badge>
    </td>
    <td className={cn(styles.cell, styles.progressCell)} data-label="Progress">
      <div className={styles.progressWrap}>
        <ProgressBar value={member.progress} tone="auto" />
      </div>
      <span className={styles.pct}>{member.progress}%</span>
    </td>
    <td className={cn(styles.cell, styles.muted)} data-label="Courses">
      {member.completed}/{member.total}
    </td>
    <td className={cn(styles.cell, styles.muted)} data-label="Last active">
      {member.lastActive}
    </td>
  </tr>
);

export interface TeamProgressTableProps {
  readonly members: readonly TeamMember[];
  readonly totalCount: number;
  readonly hasNextPage?: boolean;
  readonly isFetchingNextPage?: boolean;
  readonly onFetchNextPage?: () => void;
}

export const TeamProgressTable = ({
  members,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: TeamProgressTableProps): ReactElement => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = tableContainerRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage || !onFetchNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onFetchNextPage();
        }
      },
      {
        root: container,
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  return (
    <div ref={tableContainerRef} className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            {HEADERS.map((header) => (
              <th key={header} className={styles.th}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
          {hasNextPage ? (
            <tr ref={sentinelRef} className={styles.tableSentinelRow}>
              <td colSpan={HEADERS.length} className={styles.tableSentinelCell}>
                {isFetchingNextPage ? (
                  <div className={styles.loadingMoreRow}>
                    <Loader2 size={16} className={styles.spinner} />
                    <span>Loading more members...</span>
                  </div>
                ) : (
                  <span className={styles.srOnly}>Scroll for more</span>
                )}
              </td>
            </tr>
          ) : members.length > 0 ? (
            <tr className={styles.tableEndRow}>
              <td colSpan={HEADERS.length} className={styles.tableEndCell}>
                Showing all {totalCount} members
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
