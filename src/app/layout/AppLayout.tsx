import { useEffect, useState, type ReactElement } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@shared/utils';
import { useAuth } from '@features/auth';
import { SearchOverlay } from '@app/search/SearchOverlay';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import styles from './AppLayout.module.css';

/** Authenticated app shell: sidebar + header wrapping the routed page, plus global search. */
export const AppLayout = (): ReactElement => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Dismiss the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const handleSignOut = (): void => {
    void logout().then(() => {
      navigate('/login', { replace: true });
    });
  };

  return (
    <div className={cn(styles.shell, collapsed && styles.shellCollapsed)}>
      <AppSidebar
        user={user}
        open={navOpen}
        onNavigate={() => {
          setNavOpen(false);
        }}
      />
      {navOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close menu"
          onClick={() => {
            setNavOpen(false);
          }}
        />
      ) : null}
      <div className={styles.main}>
        <AppHeader
          user={user}
          collapsed={collapsed}
          onSignOut={handleSignOut}
          onOpenSearch={() => {
            setSearchOpen(true);
          }}
          onOpenNav={() => {
            setNavOpen(true);
          }}
          onToggleSidebar={() => {
            setCollapsed((value) => !value);
          }}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      {searchOpen ? (
        <SearchOverlay
          onClose={() => {
            setSearchOpen(false);
          }}
        />
      ) : null}
    </div>
  );
};
