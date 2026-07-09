import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { Avatar, DropdownMenu, IconButton } from '@shared/ui';
import type { AuthenticatedUser } from '@features/auth';
import { NotificationsBell } from '@features/notifications';
import { useTheme } from '@app/theme/use-theme';
import styles from './AppLayout.module.css';

export interface AppHeaderProps {
  readonly user: AuthenticatedUser | null;
  readonly onSignOut: () => void;
}

/** Top bar: theme toggle + user menu. */
export const AppHeader = ({ user, onSignOut }: AppHeaderProps): ReactElement => {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const name = user?.fullName ?? 'Guest';
  const roleLabel = user?.userType ?? null;

  return (
    <header className={styles.header}>
      <NotificationsBell />
      <IconButton
        label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggle}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>
      <DropdownMenu
        align="end"
        items={[
          {
            label: 'Profile',
            icon: <User size={16} />,
            onSelect: () => {
              navigate('/profile');
            },
          },
          {
            label: 'Settings',
            icon: <Settings size={16} />,
            onSelect: () => {
              navigate('/user-settings');
            },
          },
          {
            label: 'Sign out',
            danger: true,
            icon: <LogOut size={16} />,
            onSelect: onSignOut,
          },
        ]}
        trigger={
          <button type="button" className={styles.userTrigger}>
            <Avatar name={name} size={32} />
            <span className={styles.userBox}>
              <span className={styles.userName}>{name}</span>
              {roleLabel !== null ? (
                <span className={styles.userRole}>{roleLabel}</span>
              ) : null}
            </span>
          </button>
        }
      />
    </header>
  );
};
