import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, PanelLeft, Search, Settings, Sun, User } from 'lucide-react';
import { AcademyLogo, Avatar, DropdownMenu, IconButton } from '@shared/ui';
import { formatDisplayName, formatUserType } from '@shared/utils';
import type { AuthenticatedUser } from '@features/auth';
import { NotificationsBell } from '@features/notifications';
import { useTheme } from '@app/theme/use-theme';
import { AppLauncher } from './AppLauncher';
import styles from './AppLayout.module.css';

export interface AppHeaderProps {
  readonly user: AuthenticatedUser | null;
  readonly collapsed: boolean;
  readonly onSignOut: () => void;
  readonly onOpenSearch: () => void;
  readonly onOpenNav: () => void;
  readonly onToggleSidebar: () => void;
}

const UserMenu = ({
  user,
  onSignOut,
}: {
  readonly user: AuthenticatedUser | null;
  readonly onSignOut: () => void;
}): ReactElement => {
  const navigate = useNavigate();
  const name = formatDisplayName(user?.fullName);
  const roleLabel = user?.userType ? formatUserType(user.userType) : null;
  return (
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
        <button type="button" className={styles.userTrigger} aria-label={name}>
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
  );
};

/** Top bar: sidebar toggles + search + theme toggle + user menu. */
export const AppHeader = ({
  user,
  collapsed,
  onSignOut,
  onOpenSearch,
  onOpenNav,
  onToggleSidebar,
}: AppHeaderProps): ReactElement => {
  const { theme, toggle } = useTheme();

  return (
    <header className={styles.header}>
      <span className={styles.headerBrand} aria-hidden="true">
        <AcademyLogo size={28} />
      </span>
      <IconButton label="Open menu" className={styles.menuBtn} onClick={onOpenNav}>
        <Menu size={16} />
      </IconButton>
      <IconButton
        label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={styles.collapseBtn}
        onClick={onToggleSidebar}
      >
        <PanelLeft size={16} />
      </IconButton>
      <button type="button" className={styles.searchTrigger} onClick={onOpenSearch}>
        <Search size={16} aria-hidden="true" />
        <span>Search</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>
      <AppLauncher />
      <IconButton
        label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggle}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </IconButton>
      <NotificationsBell />
      <UserMenu user={user} onSignOut={onSignOut} />
    </header>
  );
};
