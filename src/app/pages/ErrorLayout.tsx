import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, type LucideIcon } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from './ErrorLayout.module.css';

export interface ErrorLayoutProps {
  /** Short eyebrow label above the title, e.g. an HTTP status ("404"). Omit when none applies. */
  readonly code?: string | undefined;
  readonly title: string;
  readonly message: string;
  readonly icon?: LucideIcon | undefined;
  readonly actionTo?: string | undefined;
  readonly actionLabel?: string | undefined;
}

/** Shared empty-state screen for 404 / 403 and "resource not found" — rendered inside the app shell. */
export const ErrorLayout = ({
  code,
  title,
  message,
  icon: Icon = AlertTriangle,
  actionTo = '/',
  actionLabel = 'Back to dashboard',
}: ErrorLayoutProps): ReactElement => (
  <section className={styles.wrap}>
    <div className={styles.card}>
      <div className={styles.iconBadge}>
        <Icon size={28} aria-hidden="true" />
      </div>
      {code !== undefined ? <div className={styles.code}>Error {code}</div> : null}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      <Button asChild size="lg" className={styles.action}>
        <Link to={actionTo}>
          <ArrowLeft aria-hidden="true" /> {actionLabel}
        </Link>
      </Button>
    </div>
  </section>
);
