import { useMemo, useState, type ReactElement } from 'react';
import { Alert, PageHeader, Spinner, Tabs, TabsPanel } from '@shared/ui';
import type { UserAccount } from '../domain';
import { useSetUserStatus, useUsers } from './use-users';
import { SettingsToggles, type ToggleSetting } from './SettingsToggles';
import { UsersTable } from './UsersTable';
import { PermissionsTab } from './PermissionsTab';
import styles from './AdminSettingsPage.module.css';

const PLATFORM_SETTINGS: readonly ToggleSetting[] = [
  {
    key: 'catalog',
    label: 'Enable Public Catalog',
    description: 'Show course catalog to logged-in users by default',
    defaultOn: true,
  },
  {
    key: 'approval',
    label: 'Require Admin Approval',
    description: 'New content must be approved before publishing',
    defaultOn: true,
  },
  {
    key: 'self-enrol',
    label: 'Allow Self-Enrolment',
    description: 'Let users enrol in optional courses on their own',
    defaultOn: false,
  },
  {
    key: 'email',
    label: 'Email Notifications',
    description: 'Send platform updates by email',
    defaultOn: true,
  },
];

const SECURITY_SETTINGS: readonly ToggleSetting[] = [
  {
    key: '2fa',
    label: 'Two-Factor Auth Required',
    description: 'Force 2FA for all admin accounts',
    defaultOn: true,
  },
  {
    key: 'audit',
    label: 'Audit Logging',
    description: 'Log all admin actions for compliance',
    defaultOn: true,
  },
  {
    key: 'ip',
    label: 'IP Restrictions',
    description: 'Restrict access to known office IP ranges',
    defaultOn: false,
  },
];

/** Routed admin Settings page: platform switches, user directory, and security controls. */
export const AdminSettingsPage = (): ReactElement => {
  const users = useUsers();
  const setStatus = useSetUserStatus();
  const [section, setSection] = useState('platform');
  const accounts = useMemo(() => users.data ?? [], [users.data]);
  const busyId = setStatus.isPending ? setStatus.variables.id : null;

  const toggle = (user: UserAccount): void => {
    setStatus.mutate({ id: user.id, status: user.isActive() ? 'inactive' : 'active' });
  };

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Platform Settings"
        subtitle="Configure platform-wide settings and users"
      />

      <div className={styles.card}>
        <Tabs
          value={section}
          onValueChange={setSection}
          tabs={[
            { value: 'platform', label: 'Platform' },
            { value: 'users', label: `Users (${String(accounts.length)})` },
            { value: 'permissions', label: 'Permissions' },
            { value: 'security', label: 'Security' },
          ]}
        >
          <TabsPanel value="platform">
            <SettingsToggles settings={PLATFORM_SETTINGS} />
          </TabsPanel>
          <TabsPanel value="users">
            {users.isLoading ? (
              <div className={styles.center}>
                <Spinner size="lg" label="Loading users" />
              </div>
            ) : users.isError ? (
              <Alert tone="error" title="Could not load users">
                {users.error.message}
              </Alert>
            ) : (
              <UsersTable users={accounts} busyId={busyId} onToggle={toggle} />
            )}
          </TabsPanel>
          <TabsPanel value="permissions">
            <PermissionsTab />
          </TabsPanel>
          <TabsPanel value="security">
            <SettingsToggles settings={SECURITY_SETTINGS} />
          </TabsPanel>
        </Tabs>
      </div>
    </section>
  );
};
