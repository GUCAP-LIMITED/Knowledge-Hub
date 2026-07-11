import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Alert, Spinner } from '@shared/ui';
import { useAuth } from './use-auth';
import { AuthLayout } from './AuthLayout';
import { AuthField } from './AuthField';
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
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          required
        />
        <button type="submit" className={styles.submit} disabled={!canSubmit || isBusy}>
          {isBusy ? <Spinner size="sm" /> : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  );
};
