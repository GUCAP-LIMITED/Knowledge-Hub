import { type ReactElement, useState } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { PermissionSetEditor } from './PermissionSetEditor';
import { PermissionSetsPanel } from './PermissionSetsPanel';
import { UserTypePermissionsPanel } from './UserTypePermissionsPanel';
import { usePermissionSet, usePermissionSets } from './use-permissions';
import styles from './PermissionsManager.module.css';

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

      {sets.isPending ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading permission sets" />
        </div>
      ) : null}

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
        <div className={styles.center}>
          <Spinner size="lg" label="Loading permissions" />
        </div>
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
