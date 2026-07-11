import type { ReactElement, ReactNode } from 'react';
import { UappLogo } from './UappLogo';
import styles from './AuthLayout.module.css';

export interface AuthLayoutProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
  /** Footer row under the form (links such as "Sign up" / "Log in"). */
  readonly footer?: ReactNode;
}

/** Single-column, centered auth shell matching the UAPP SSO: logo, heading, form, footer. */
export const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps): ReactElement => (
  <main className={styles.screen}>
    <div className={styles.card}>
      <UappLogo size={40} />
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      {children}
      {footer !== undefined ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  </main>
);
