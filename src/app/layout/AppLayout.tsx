import { useEffect, useState, type ReactElement } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { SearchOverlay } from '@app/search/SearchOverlay';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import styles from './AppLayout.module.css';

/** Authenticated app shell: sidebar + header wrapping the routed page, plus global search. */
export const AppLayout = (): ReactElement => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

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

  const handleSignOut = (): void => {
    void logout().then(() => {
      navigate('/login', { replace: true });
    });
  };

  return (
    <div className={styles.shell}>
      <AppSidebar user={user} />
      <div className={styles.main}>
        <AppHeader
          user={user}
          onSignOut={handleSignOut}
          onOpenSearch={() => {
            setSearchOpen(true);
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
