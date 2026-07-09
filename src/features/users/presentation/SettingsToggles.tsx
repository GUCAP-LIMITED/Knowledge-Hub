import { useState, type ReactElement } from 'react';
import { Toggle } from '@shared/ui';
import styles from './AdminSettingsPage.module.css';

export interface ToggleSetting {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly defaultOn: boolean;
}

export interface SettingsTogglesProps {
  readonly settings: readonly ToggleSetting[];
}

/** A stacked list of platform switches with local (demo) persistence. */
export const SettingsToggles = ({ settings }: SettingsTogglesProps): ReactElement => {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(settings.map((setting) => [setting.key, setting.defaultOn])),
  );

  return (
    <div className={styles.toggles}>
      {settings.map((setting) => (
        <Toggle
          key={setting.key}
          label={setting.label}
          description={setting.description}
          checked={state[setting.key] ?? setting.defaultOn}
          onChange={(checked) => {
            setState((prev) => ({ ...prev, [setting.key]: checked }));
          }}
        />
      ))}
    </div>
  );
};
