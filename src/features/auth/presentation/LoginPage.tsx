import { useState, type FormEvent, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, TextField } from '@shared/ui';
import { useAuth } from './use-auth';
import styles from './LoginPage.module.css';

/** Sign-in screen. Collects an email + password and authenticates against the JSON API. */
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
    <main className={styles.screen}>
      <section className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>UAPP Academy — Knowledge Hub</h1>
          <p className={styles.subtitle}>
            Demo sign-in: admin@uapp.com, manager@uapp.com or consultant@uapp.com (any
            password).
          </p>
        </header>

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
          <Button type="submit" isLoading={isBusy} fullWidth disabled={!canSubmit}>
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
};
