import { type ReactElement, useState } from 'react';
import { Alert, CardGridSkeleton, Skeleton } from '@shared/ui';
import { PermissionSetEditor } from './PermissionSetEditor';
import { PermissionSetsPanel } from './PermissionSetsPanel';
import { UserTypePermissionsPanel } from './UserTypePermissionsPanel';
import { usePermissionSet, usePermissionSets } from './use-permissions';
import styles from './PermissionsManager.module.css';

const PermissionSetEditorSkeleton = (): ReactElement => (
  <div className={styles.editor} aria-hidden="true">
    <div className={styles.editorHead}>
      <Skeleton width={36} height={36} radius={8} />
      <Skeleton width="30%" height={16} />
    </div>
    <div className={styles.editorBody}>
      <div className={styles.moduleList}>
        {Array.from({ length: 6 }, (_unused, index) => (
          <div key={`skeleton-module-${String(index)}`} className={styles.moduleItem}>
            <Skeleton width={20} height={20} radius={6} />
            <Skeleton width="70%" height={12} />
          </div>
        ))}
      </div>
      <div className={styles.gridPane}>
        <div className={styles.granGrid}>
          {Array.from({ length: 4 }, (_unused, index) => (
            <div key={`skeleton-gran-${String(index)}`} className={styles.granCard}>
              <Skeleton width={16} height={16} radius={4} />
              <Skeleton width="80%" height={12} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Settings → Permissions surface: bind permission sets to user types, manage the sets, and edit a
 * selected set's granular grants. Fully API-backed via the `permissions` feature slice.
 */
export const PermissionsManager = (): ReactElement => {
  const sets = usePermissionSets();
  const [activeSetId, setActiveSetId] = useState('');
  const detail = usePermissionSet(activeSetId);

  const select = (id: string): void => {
    setActiveSetId((current) => (current === id ? '' : id));
  };

  return (
    <div className={styles.page}>
      <div>
        <h2 className={styles.pageTitle}>Permissions</h2>
        <p className={styles.pageSub}>
          Configure role-based and user-level permission sets.
        </p>
      </div>

      <UserTypePermissionsPanel />

      {sets.isPending ? <CardGridSkeleton count={4} /> : null}

      {sets.isError ? (
        <Alert tone="error" title="Could not load permission sets">
          {sets.error.message}
        </Alert>
      ) : null}

      {sets.isSuccess ? (
        <PermissionSetsPanel
          sets={sets.data}
          activeSetId={activeSetId}
          onSelect={select}
        />
      ) : null}

      {activeSetId.length > 0 && detail.isPending ? (
        <PermissionSetEditorSkeleton />
      ) : null}

      {activeSetId.length > 0 && detail.isError ? (
        <Alert tone="error" title="Could not load this permission set">
          {detail.error.message}
        </Alert>
      ) : null}

      {activeSetId.length > 0 && detail.isSuccess ? (
        <PermissionSetEditor key={activeSetId} detail={detail.data} />
      ) : null}
    </div>
  );
};
