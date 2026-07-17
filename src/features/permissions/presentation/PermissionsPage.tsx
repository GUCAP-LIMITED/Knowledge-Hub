import { type ReactElement } from 'react';
import { PageHeader } from '@shared/ui';
import { PermissionsManager } from './PermissionsManager';
import styles from './PermissionsPage.module.css';

/**
 * Full-page version of the permissions surface (admin route). The same {@link PermissionsManager} is
 * embedded in Settings → Permissions; this route keeps a standalone, code-split entry point.
 */
export const PermissionsPage = (): ReactElement => (
  <main className={styles.screen}>
    <PageHeader
      title="Permissions"
      subtitle="Define permission sets and bind them to user types."
    />
    <PermissionsManager />
  </main>
);
