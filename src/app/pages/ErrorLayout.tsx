import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './ErrorLayout.module.css';

export interface ErrorLayoutProps {
  readonly code: string;
  readonly title: string;
  readonly message: string;
}

/** Shared empty-route screen for 404 / 403 — rendered inside the app shell. */
export const ErrorLayout = ({ code, title, message }: ErrorLayoutProps): ReactElement => (
  <section className={styles.wrap}>
    <div className={styles.code}>{code}</div>
    <h1 className={styles.title}>{title}</h1>
    <p className={styles.message}>{message}</p>
    <Link to="/" className={styles.action}>
      <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
    </Link>
  </section>
);
