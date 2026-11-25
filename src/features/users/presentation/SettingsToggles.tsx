import type { ReactElement } from 'react';
import { Skeleton, Toggle } from '@shared/ui';
import styles from './AdminSettingsPage.module.css';
import { usePlatformSettings, useUpdatePlatformSettings } from './use-platform-settings';
import type { PlatformSettings } from '../domain';

export interface ToggleSetting {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly defaultOn: boolean;
}

export interface SettingsTogglesProps {
  readonly settings: readonly ToggleSetting[];
}

/** A stacked list of platform switches connected to the backend. */
export const SettingsToggles = ({ settings }: SettingsTogglesProps): ReactElement => {
  const { data: platformSettings, isLoading, isError } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  if (isLoading) {
    return (
      <div className={styles.toggles} aria-hidden="true">
        {settings.map((setting) => (
          <div key={setting.key} className={styles.toggleSkeletonRow}>
            <div className={styles.toggleSkeletonText}>
              <Skeleton width="35%" height={14} />
              <Skeleton width="60%" height={12} />
            </div>
            <Skeleton width={40} height={22} radius={999} />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !platformSettings) {
    return <div>Error loading settings.</div>;
  }

  const currentSettings = platformSettings;

  // Convert kebab-case settings keys to camelCase to match PlatformSettings
  const toCamelCase = (str: string): string =>
    str.replace(/-([a-z])/g, (_match: string, p1: string) => p1.toUpperCase());

  return (
    <div className={styles.toggles}>
      {settings.map((setting) => {
        const camelKey = toCamelCase(setting.key) as keyof PlatformSettings;
        return (
          <Toggle
            key={setting.key}
            label={setting.label}
            description={setting.description}
            checked={currentSettings[camelKey]}
            onChange={(checked) => {
              updateSettings.mutate({
                ...currentSettings,
                [camelKey]: checked,
              });
            }}
          />
        );
      })}
    </div>
  );
};
