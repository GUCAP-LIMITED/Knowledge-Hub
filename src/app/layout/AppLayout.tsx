import type { ReactElement } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import styles from './AppLayout.module.css';

/** Authenticated app shell: sidebar + header wrapping the routed page. */
export const AppLayout = (): ReactElement => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = (): void => {
    void logout().then(() => {
      navigate('/login', { replace: true });
    });
  };

  return (
    <div className={styles.shell}>
      <AppSidebar user={user} />
      <div className={styles.main}>
        <AppHeader user={user} onSignOut={handleSignOut} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
