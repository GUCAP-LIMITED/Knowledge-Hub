import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, TextField } from '@shared/ui';
import { useAuth } from './use-auth';
import { AuthLayout } from './AuthLayout';
import styles from './AuthLayout.module.css';

/** Single-step sign-up: email + password creates the account and signs the user straight in. */
export const SignupPage = (): ReactElement => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, isBusy } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const succeeded = await register(email, password);
    if (succeeded) {
      navigate('/', { replace: true });
    }
  };

  const canSubmit = email.trim() !== '' && password.trim() !== '';

  return (
    <AuthLayout
      title="Get Started with UAPP"
      subtitle="Create your account to explore courses, tutorials and resources."
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Log in
          </Link>
        </span>
      }
    >
      {error !== null ? (
        <Alert tone="error" title="Sign-up failed">
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
          label="Email Address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          placeholder="name@email.com"
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          placeholder="Create a password"
          required
        />
        <Button type="submit" isLoading={isBusy} fullWidth disabled={!canSubmit}>
          Sign up
        </Button>
      </form>
    </AuthLayout>
  );
};
