import { useEffect, useState, type ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn, useBodyScrollLock } from '@shared/utils';
import { useAuth } from '@features/auth';
import { UploadProgressWidget } from '@features/content';
import { SearchOverlay } from '@app/search/SearchOverlay';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppBottomNav } from './AppBottomNav';
import { useSignOut } from './use-sign-out';
import styles from './AppLayout.module.css';

/** Authenticated app shell: sidebar + header wrapping the routed page, plus global search. */
export const AppLayout = (): ReactElement => {
  const { user } = useAuth();
  const handleSignOut = useSignOut();
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

  // Lock background scroll while the mobile drawer is open.
  useBodyScrollLock(navOpen);

  return (
    <div className={cn(styles.shell, collapsed && styles.shellCollapsed)}>
      <AppSidebar
        open={navOpen}
        collapsed={collapsed}
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
      <AppBottomNav />
      <UploadProgressWidget />
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
