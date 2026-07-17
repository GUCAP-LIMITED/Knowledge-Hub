import { type ReactElement, useState } from 'react';
import { Alert, EmptyState, PageHeader, Spinner, TextField } from '@shared/ui';
import { AssignManagerForm } from './AssignManagerForm';
import { HierarchyEdgesList } from './HierarchyEdgesList';
import { HierarchyTree } from './HierarchyTree';
import { useBranchEdges, useBranchTree } from './use-hierarchy';
import styles from './HierarchyPage.module.css';

/**
 * User-hierarchy management: pick a branch, view its org chart, and assign/remove reporting lines.
 * Backed by `/api/app/user-hierarchy`.
 */
export const HierarchyPage = (): ReactElement => {
  const [branchId, setBranchId] = useState('');
  const tree = useBranchTree(branchId);
  const edges = useBranchEdges(branchId);
  const hasBranch = branchId.length > 0;

  return (
    <main className={styles.screen}>
      <PageHeader
        title="Org Chart"
        subtitle="Manage per-branch reporting lines (drives Team data scope)."
      />

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Branch</h2>
        <TextField
          label="Branch id"
          placeholder="Paste a branch id to load its chart"
          value={branchId}
          onChange={(event) => {
            setBranchId(event.target.value.trim());
          }}
        />
      </div>

      {hasBranch ? <AssignManagerForm branchId={branchId} /> : null}

      {hasBranch && tree.isPending ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading org chart" />
        </div>
      ) : null}

      {hasBranch && tree.isError ? (
        <Alert tone="error" title="Could not load org chart">
          {tree.error.message}
        </Alert>
      ) : null}

      {hasBranch && tree.isSuccess ? (
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Org chart</h2>
          {tree.data.length === 0 ? (
            <EmptyState
              title="No reporting lines"
              description="Assign a manager to build the chart."
            />
          ) : (
            <HierarchyTree roots={tree.data} />
          )}
        </div>
      ) : null}

      {hasBranch && edges.isSuccess && edges.data.length > 0 ? (
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Edges</h2>
          <HierarchyEdgesList edges={edges.data} />
        </div>
      ) : null}
    </main>
  );
};
