import { useMemo, useState, type ReactElement } from 'react';
import { Alert, PageHeader, Spinner, Tabs, TabsPanel } from '@shared/ui';
import { ContentTypesManager } from '@features/content-types';
import type { UserAccount } from '../domain';
import { useSetUserStatus, useUsers } from './use-users';
import { SettingsToggles, type ToggleSetting } from './SettingsToggles';
import { UsersTable } from './UsersTable';
import { PermissionsTab } from './PermissionsTab';
import styles from './AdminSettingsPage.module.css';

const PLATFORM_SETTINGS: readonly ToggleSetting[] = [
  {
    key: 'public-signup',
    label: 'Public sign-up',
    description: 'Let new people create an account without an invite',
    defaultOn: true,
  },
  {
    key: 'public-catalog',
    label: 'Public course catalog',
    description: 'Show courses, tutorials & resources to signed-out visitors',
    defaultOn: false,
  },
  {
    key: 'approval',
    label: 'Require review before publishing',
    description: 'Uploads enter the approval queue instead of going live',
    defaultOn: true,
  },
  {
    key: 'self-enrol',
    label: 'Allow self-enrolment',
    description: 'Let learners enrol in optional courses on their own',
    defaultOn: true,
  },
  {
    key: 'auto-certificates',
    label: 'Auto-issue certificates',
    description: 'Award a certificate automatically when a course is completed',
    defaultOn: true,
  },
  {
    key: 'ratings',
    label: 'Course ratings & reviews',
    description: 'Let learners rate courses and leave written feedback',
    defaultOn: true,
  },
  {
    key: 'reminders',
    label: 'Mandatory-training reminders',
    description: 'Email learners who have not finished required courses',
    defaultOn: true,
  },
  {
    key: 'email',
    label: 'Email notifications',
    description: 'Send platform updates and announcements by email',
    defaultOn: true,
  },
];

/** Routed admin Settings page: platform switches, user directory, and permissions. */
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
            { value: 'content-types', label: 'Content Types' },
            { value: 'users', label: `Users (${String(accounts.length)})` },
            { value: 'permissions', label: 'Permissions' },
          ]}
        >
          <TabsPanel value="platform">
            <SettingsToggles settings={PLATFORM_SETTINGS} />
          </TabsPanel>
          <TabsPanel value="content-types">
            <ContentTypesManager />
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
        </Tabs>
      </div>
    </section>
  );
};
