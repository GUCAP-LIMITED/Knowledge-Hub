import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, TextField } from '@shared/ui';
import { useAuth } from './use-auth';
import { AuthLayout } from './AuthLayout';
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
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          placeholder="you@example.com"
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          placeholder="Enter your password"
          required
        />
        <div className={styles.formRowEnd}>
          <Link to="/forgot-password" className={styles.link}>
            Forgot password?
          </Link>
        </div>
        <Button type="submit" isLoading={isBusy} fullWidth disabled={!canSubmit}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
};
