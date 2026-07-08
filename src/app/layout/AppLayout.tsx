import type { ReactElement } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import { useAuth } from '@features/auth';
import styles from './AppLayout.module.css';

interface NavItem {
  readonly to: string;
  readonly label: string;
  /** When set, the item shows only for users holding one of these roles. */
  readonly anyOf?: readonly string[];
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/courses', label: 'Courses' },
  { to: '/tutorials', label: 'Tutorials' },
  { to: '/resources', label: 'Resources' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/submissions', label: 'My Submissions', anyOf: ['admin', 'manager'] },
  { to: '/approvals', label: 'Approvals', anyOf: ['admin'] },
];

/** Authenticated app shell: brand + role-aware navigation + a header, wrapping the routed page. */
export const AppLayout = (): ReactElement => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter(
    (item) => item.anyOf === undefined || (user?.hasAnyRole(item.anyOf) ?? false),
  );

  const handleSignOut = (): void => {
    void logout().then(() => {
      navigate('/login', { replace: true });
    });
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>UA</span>
          <span className={styles.brandText}>
            <strong>UAPP Academy</strong>
            <small>Knowledge Hub</small>
          </span>
        </div>
        <nav className={styles.nav}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(styles.navLink, isActive && styles.navLinkActive)
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.userBox}>
            <span className={styles.userName}>{user?.fullName ?? 'Guest'}</span>
            {user?.userType !== null && user?.userType !== undefined ? (
              <span className={styles.userRole}>{user.userType}</span>
            ) : null}
          </div>
          <Button size="sm" variant="ghost" onClick={handleSignOut}>
            Sign out
          </Button>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
