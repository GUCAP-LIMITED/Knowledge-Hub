import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, TextField } from '@shared/ui';
import { AuthLayout } from './AuthLayout';
import styles from './AuthLayout.module.css';

/** Public sign-up: collect an email, then hand off to email verification. */
export const SignupPage = (): ReactElement => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // No backend yet — the email is passed to the verify screen via router state (never the URL).
    navigate('/verify', { state: { email: email.trim() } });
  };

  return (
    <AuthLayout
      title="Get Started with UAPP"
      subtitle="Create your account to explore courses, tutorials and resources."
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
          Sign up
        </Button>
      </form>
    </AuthLayout>
  );
};
