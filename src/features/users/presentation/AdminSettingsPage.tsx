import type { ReactElement } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PageHeader } from '@shared/ui';
import { ContentTypesManager } from '@features/content-types';
import { CertificateTemplatesManager } from '@features/certificate-templates';
import { SettingsToggles } from './SettingsToggles';
import { RolePermissions } from './RolePermissions';
import { UsersSection } from './UsersSection';
import {
  PLATFORM_SETTINGS,
  SETTINGS_SECTIONS,
  isSettingsSection,
  type SettingsSectionKey,
} from './settings-sections';
import styles from './AdminSettingsPage.module.css';

const PANELS: Record<SettingsSectionKey, () => ReactElement> = {
  platform: () => <SettingsToggles settings={PLATFORM_SETTINGS} />,
  'content-types': () => <ContentTypesManager />,
  certificates: () => <CertificateTemplatesManager />,
  users: () => <UsersSection />,
  permissions: () => <RolePermissions />,
};

/** Routed admin Settings page — one section per URL, chosen from the sidebar submenu. */
export const AdminSettingsPage = (): ReactElement => {
  const { section } = useParams();
  if (!isSettingsSection(section)) {
    return <Navigate to="/settings/platform" replace />;
  }
  const meta = SETTINGS_SECTIONS.find((entry) => entry.key === section);
  const Panel = PANELS[section];

  return (
    <section className={styles.screen}>
      <PageHeader title={meta?.title ?? 'Settings'} subtitle={meta?.subtitle ?? ''} />
      <div className={styles.card}>
        <Panel />
      </div>
    </section>
  );
};
