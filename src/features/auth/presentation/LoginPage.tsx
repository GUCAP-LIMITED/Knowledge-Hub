import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Alert, Spinner } from '@shared/ui';
import { useAuth } from './use-auth';
import { AuthLayout } from './AuthLayout';
import styles from './AuthLayout.module.css';

/** Sign-in screen. A single button hands off to the Uapp Portal for SSO. */
export const LoginPage = (): ReactElement => {
  const { beginSso, status, error, isAuthenticated, isBusy } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout subtitle="Sign in with your UAPP account to continue.">
      {error !== null ? (
        <Alert tone="error" title="Sign-in failed">
          {error}
        </Alert>
      ) : null}

      {status === 'authenticating' ? (
        <div className={styles.form}>
          <Spinner size="lg" label="Signing you in" />
        </div>
      ) : (
        <div className={styles.form}>
          <button
            type="button"
            className={styles.submit}
            onClick={beginSso}
            disabled={isBusy}
          >
            <LogIn size={18} aria-hidden />
            Sign in with UAPP
          </button>
        </div>
      )}
    </AuthLayout>
  );
};
