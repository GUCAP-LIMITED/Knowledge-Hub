import { useEffect, useState, type ReactElement } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@shared/ui';
import { AuthLayout } from './AuthLayout';
import styles from './AuthLayout.module.css';

const RESEND_SECONDS = 52;

interface VerifyState {
  readonly email?: string;
}

/** Post-signup screen: confirms the verification email was sent and counts down to a resend. */
export const VerifyPage = (): ReactElement => {
  const location = useLocation();
  const email = (location.state as VerifyState | null)?.email ?? '';
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds === 0) {
      return;
    }
    const timer = setTimeout(() => {
      setSeconds((value) => value - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [seconds]);

  if (email === '') {
    return <Navigate to="/signup" replace />;
  }

  return (
    <AuthLayout
      title="Let's Get Verified."
      subtitle="Please check your inbox to verify your account."
      footer={
        <Link to="/login" className={styles.link}>
          <ArrowLeft size={14} aria-hidden="true" /> Back to login
        </Link>
      }
    >
      <div className={styles.form}>
        <p className={styles.resend}>
          We&apos;ve sent an email to <span className={styles.resendStrong}>{email}</span>
          . Please check to verify.
        </p>
        {seconds > 0 ? (
          <p className={styles.resend}>
            Resend in <span className={styles.resendStrong}>{seconds}s</span>
          </p>
        ) : (
          <Button
            fullWidth
            variant="secondary"
            onClick={() => {
              setSeconds(RESEND_SECONDS);
            }}
          >
            <MailCheck size={16} aria-hidden="true" /> Resend email
          </Button>
        )}
      </div>
    </AuthLayout>
  );
};
