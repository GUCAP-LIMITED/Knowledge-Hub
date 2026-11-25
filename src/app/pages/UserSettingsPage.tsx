import { useState, type ReactElement } from 'react';
import { PageHeader, Select, Tabs, TabsPanel, Toggle } from '@shared/ui';
import { useLocalStorage } from '@shared/utils';
import { useAuth } from '@features/auth';
import { useTheme } from '@app/theme/use-theme';
import styles from './UserSettingsPage.module.css';

interface Preferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  profileVisible: boolean;
  showActivity: boolean;
  language: string;
  timezone: string;
}

const DEFAULTS: Preferences = {
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  profileVisible: true,
  showActivity: false,
  language: 'en',
  timezone: 'UTC',
};

const TABS = [
  { value: 'notifications', label: 'Notifications' },
  { value: 'appearance', label: 'Appearance' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'language', label: 'Language' },
] as const;

interface PanelProps {
  readonly prefs: Preferences;
  readonly onChange: (prefs: Preferences) => void;
}

const NotificationsPanel = ({ prefs, onChange }: PanelProps): ReactElement => (
  <div className={styles.group}>
    <Toggle
      label="Email notifications"
      description="Get product updates and important emails."
      checked={prefs.emailNotifications}
      onChange={(value) => {
        onChange({ ...prefs, emailNotifications: value });
      }}
    />
    <Toggle
      label="Push notifications"
      description="Receive browser push notifications."
      checked={prefs.pushNotifications}
      onChange={(value) => {
        onChange({ ...prefs, pushNotifications: value });
      }}
    />
    <Toggle
      label="Weekly digest"
      description="A summary of activity, every Monday."
      checked={prefs.weeklyDigest}
      onChange={(value) => {
        onChange({ ...prefs, weeklyDigest: value });
      }}
    />
  </div>
);

const AppearancePanel = (): ReactElement => {
  const { theme, toggle } = useTheme();
  return (
    <div className={styles.group}>
      <Toggle
        label="Dark mode"
        description="Easier on the eyes in low light."
        checked={theme === 'dark'}
        onChange={() => {
          toggle();
        }}
      />
    </div>
  );
};

const PrivacyPanel = ({ prefs, onChange }: PanelProps): ReactElement => (
  <div className={styles.group}>
    <Toggle
      label="Profile visible to team"
      description="Let teammates see your name, role and progress."
      checked={prefs.profileVisible}
      onChange={(value) => {
        onChange({ ...prefs, profileVisible: value });
      }}
    />
    <Toggle
      label="Show learning activity"
      description="Allow your activity to appear on team dashboards."
      checked={prefs.showActivity}
      onChange={(value) => {
        onChange({ ...prefs, showActivity: value });
      }}
    />
  </div>
);

const LanguagePanel = ({ prefs, onChange }: PanelProps): ReactElement => (
  <div className={styles.fields}>
    <Select
      label="Language"
      value={prefs.language}
      onChange={(value) => {
        onChange({ ...prefs, language: value });
      }}
      options={[
        { value: 'en', label: 'English (UK)' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
      ]}
    />
    <Select
      label="Timezone"
      value={prefs.timezone}
      onChange={(value) => {
        onChange({ ...prefs, timezone: value });
      }}
      options={[
        { value: 'UTC', label: 'UTC' },
        { value: 'GMT', label: 'GMT (London)' },
        { value: 'EST', label: 'EST (New York)' },
      ]}
    />
  </div>
);

/** Account preferences: notifications, appearance (dark mode), privacy and language. */
export const UserSettingsPage = (): ReactElement => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useLocalStorage<Preferences>(
    `uapp:preferences:${user?.id ?? 'guest'}`,
    DEFAULTS,
  );
  const [tab, setTab] = useState<string>('notifications');

  return (
    <section className={styles.screen}>
      <PageHeader title="Settings" subtitle="Manage your account preferences." />
      <div className={styles.card}>
        <Tabs
          tabs={TABS.map((entry) => ({ value: entry.value, label: entry.label }))}
          value={tab}
          onValueChange={setTab}
        >
          <TabsPanel value="notifications">
            <NotificationsPanel prefs={prefs} onChange={setPrefs} />
          </TabsPanel>
          <TabsPanel value="appearance">
            <AppearancePanel />
          </TabsPanel>
          <TabsPanel value="privacy">
            <PrivacyPanel prefs={prefs} onChange={setPrefs} />
          </TabsPanel>
          <TabsPanel value="language">
            <LanguagePanel prefs={prefs} onChange={setPrefs} />
          </TabsPanel>
        </Tabs>
      </div>
    </section>
  );
};
