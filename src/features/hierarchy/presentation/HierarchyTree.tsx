import type { ReactElement } from 'react';
import { Badge } from '@shared/ui';
import type { HierarchyNode } from '../domain';
import styles from './HierarchyPage.module.css';

const NodeItem = ({ node }: { readonly node: HierarchyNode }): ReactElement => (
  <li>
    <div className={styles.node}>
      <span className={styles.nodeName}>
        {node.userName ?? node.email ?? node.userId}
      </span>
      <Badge tone="info" size="sm">
        {node.userTypeName}
      </Badge>
      <Badge tone="neutral" size="sm">
        Level {node.hierarchyLevel}
      </Badge>
    </div>
    {node.reports.length > 0 ? (
      <ul className={styles.subtree}>
        {node.reports.map((child) => (
          <NodeItem key={`${child.userId}:${child.userTypeId}`} node={child} />
        ))}
      </ul>
    ) : null}
  </li>
);

/** Renders one or more org-chart roots as an indented tree. */
export const HierarchyTree = ({
  roots,
}: {
  readonly roots: readonly HierarchyNode[];
}): ReactElement => (
  <ul className={styles.tree}>
    {roots.map((node) => (
      <NodeItem key={`${node.userId}:${node.userTypeId}`} node={node} />
    ))}
  </ul>
);
