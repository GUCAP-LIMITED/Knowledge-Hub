import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, TextField } from '@shared/ui';
import { AuthLayout } from './AuthLayout';
import styles from './AuthLayout.module.css';

/** Public password-reset request: collect an email, then hand off to email verification. */
export const ForgotPasswordPage = (): ReactElement => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    navigate('/verify', { state: { email: email.trim() } });
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className={styles.link}>
          <ArrowLeft size={14} aria-hidden="true" /> Back to login
        </Link>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
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
        <Button type="submit" fullWidth disabled={email.trim() === ''}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
};
