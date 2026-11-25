import type { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_USERS, type MockUser } from '@app/mock-api';
import styles from './MockPortal.module.css';

const buildReturnUrl = (params: URLSearchParams, user: MockUser): string => {
  const origin = params.get('redirect') ?? window.location.origin;
  const returnParams = new URLSearchParams({ token: user.id });
  const pathname = params.get('pathname');
  if (pathname !== null) {
    returnParams.set('pathname', pathname);
  }
  return `${origin}/?${returnParams.toString()}`;
};

/**
 * Stand-in for the Uapp Portal SSO login. The real portal authenticates the user and bounces back
 * with `?token=<secret>`; this demo version lets you pick who to sign in as, then does the same.
 */
export const MockPortalLoginPage = (): ReactElement => {
  const [params] = useSearchParams();

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <h1 className={styles.title}>UAPP Portal (demo)</h1>
        <p className={styles.hint}>
          This build has no backend. Choose a demo account to sign in to Academy.
        </p>
        <ul className={styles.users}>
          {MOCK_USERS.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className={styles.user}
                onClick={() => {
                  window.location.assign(buildReturnUrl(params, user));
                }}
              >
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userMeta}>
                  {user.userTypeName} · {user.email}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};
