import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Alert, Spinner } from '@shared/ui';
import { useAuth } from './use-auth';
import { AuthLayout } from './AuthLayout';
import { AuthField } from './AuthField';
import styles from './AuthLayout.module.css';

/** Sign-in screen. Collects an email + password and authenticates against the demo directory. */
export const LoginPage = (): ReactElement => {
  // Prefilled for the offline demo directory. Try manager@uapp.com or consultant@uapp.com too.
  const [email, setEmail] = useState('admin@uapp.com');
  const [password, setPassword] = useState('password');
  const { login, error, isBusy } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const succeeded = await login(email, password);
    if (succeeded) {
      navigate('/', { replace: true });
    }
  };

  const canSubmit = email.trim() !== '' && password.trim() !== '';

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your journey"
      footer={
        <span>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className={styles.link}>
            Sign up
          </Link>
        </span>
      }
    >
      {error !== null ? (
        <Alert tone="error" title="Sign-in failed">
          {error}
        </Alert>
      ) : null}

      <form
        className={styles.form}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <AuthField
          label="Email Address"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="name@email.com"
          required
        />
        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
          required
        />
        <div className={styles.formRowEnd}>
          <Link to="/forgot-password" className={styles.link}>
            Forgot password?
          </Link>
        </div>
        <button type="submit" className={styles.submit} disabled={!canSubmit || isBusy}>
          {isBusy ? <Spinner size="sm" /> : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
};
