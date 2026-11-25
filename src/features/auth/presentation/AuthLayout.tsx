import type { ReactElement, ReactNode } from 'react';
import { cn } from '@shared/utils';
import { UappLogo } from './UappLogo';
import styles from './AuthLayout.module.css';

export interface AuthLayoutProps {
  readonly subtitle: string;
  readonly children: ReactNode;
  /** Product word shown after the UAPP wordmark. */
  readonly product?: string;
  /** Footer row under the action (optional). */
  readonly footer?: ReactNode;
}

/**
 * Centered auth shell matching the UAPP SSO / Leads login: soft brand blobs behind a card with the
 * UAPP mark, the `UAPP® <product>` wordmark, a subtitle and the action.
 */
export const AuthLayout = ({
  subtitle,
  children,
  product = 'Academy',
  footer,
}: AuthLayoutProps): ReactElement => (
  <main className={styles.screen}>
    <div className={cn(styles.blob, styles.blobTeal)} aria-hidden />
    <div className={cn(styles.blob, styles.blobOrange)} aria-hidden />
    <div className={styles.card}>
      <UappLogo size={40} />
      <header className={styles.header}>
        <h1 className={styles.brand}>
          UAPP<sup className={styles.reg}>®</sup>{' '}
          <span className={styles.product}>{product}</span>
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      {children}
      {footer !== undefined ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  </main>
);
