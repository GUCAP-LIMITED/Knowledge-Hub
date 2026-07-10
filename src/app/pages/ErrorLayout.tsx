import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import styles from './ErrorLayout.module.css';

export interface ErrorLayoutProps {
  readonly icon: LucideIcon;
  readonly code: string;
  readonly title: string;
  readonly message: string;
}

/** Shared, branded empty-route screen for 404 / 403 — rendered inside the app shell. */
export const ErrorLayout = ({
  icon: Icon,
  code,
  title,
  message,
}: ErrorLayoutProps): ReactElement => (
  <section className={styles.wrap}>
    <span className={styles.icon}>
      <Icon size={28} aria-hidden="true" />
    </span>
    <div className={styles.code}>{code}</div>
    <h1 className={styles.title}>{title}</h1>
    <p className={styles.message}>{message}</p>
    <Link to="/" className={styles.action}>
      <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
    </Link>
  </section>
);
