import type { ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge, IconButton } from '@shared/ui';
import type { HierarchyEdge } from '../domain';
import { useRemoveOverride } from './use-hierarchy';
import styles from './HierarchyPage.module.css';

const shortId = (id: string): string => (id.length > 8 ? `${id.slice(0, 8)}…` : id);

/** Flat edge list with source badges; Local overrides can be removed. */
export const HierarchyEdgesList = ({
  edges,
}: {
  readonly edges: readonly HierarchyEdge[];
}): ReactElement => {
  const removeOverride = useRemoveOverride();

  return (
    <ul className={styles.list}>
      {edges.map((edge) => (
        <li
          key={`${edge.subordinateId}:${edge.subordinateUserTypeId}:${edge.branchId}`}
          className={styles.row}
        >
          <span className={styles.rowMeta}>
            <span className={styles.mono}>{shortId(edge.subordinateId)}</span>
            <span className={styles.muted}>reports to</span>
            <span className={styles.mono}>{shortId(edge.managerId)}</span>
            {edge.source === 5 ? (
              <Badge tone="primary" size="sm">
                Local
              </Badge>
            ) : (
              <Badge tone="neutral" size="sm">
                Portal
              </Badge>
            )}
          </span>
          {edge.source === 5 ? (
            <IconButton
              label="Remove reporting line"
              variant="danger"
              disabled={removeOverride.isPending}
              onClick={() => {
                removeOverride.mutate({
                  subordinateId: edge.subordinateId,
                  subordinateUserTypeId: edge.subordinateUserTypeId,
                  branchId: edge.branchId,
                });
              }}
            >
              <Trash2 size={16} aria-hidden />
            </IconButton>
          ) : null}
        </li>
      ))}
    </ul>
  );
};
