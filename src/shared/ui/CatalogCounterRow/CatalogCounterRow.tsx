import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import { Badge } from '@shared/ui/Badge/Badge';
import { Skeleton } from '@shared/ui/Skeleton/Skeleton';
import styles from './CatalogCounterRow.module.css';

export interface CatalogCounterRowProps {
  readonly count: number;
  readonly isLoading: boolean;
  readonly filtered: boolean;
  readonly singular: string;
  readonly plural: string;
  readonly icon?: LucideIcon | undefined;
  readonly className?: string | undefined;
}

/** Reusable dynamic catalog counter pill rendered under the short summary and above filters. */
export const CatalogCounterRow = ({
  count,
  isLoading,
  filtered,
  singular,
  plural,
  icon: Icon,
  className,
}: CatalogCounterRowProps): ReactElement => {
  if (isLoading) {
    return (
      <div className={cn(styles.counterRow, className)} aria-live="polite">
        <Skeleton width={110} height={26} radius={999} />
      </div>
    );
  }

  const noun = count === 1 ? singular : plural;
  const statusLabel = filtered ? 'found' : 'available';

  return (
    <div className={cn(styles.counterRow, className)} aria-live="polite">
      <Badge tone="neutral" size="md" icon={Icon}>
        <span className={styles.counterBadgeText}>
          <strong>{count.toLocaleString()}</strong> {noun} {statusLabel}
        </span>
      </Badge>
    </div>
  );
};
