import type { ReactElement, ReactNode } from 'react';
import { AuthAside } from './AuthAside';
import styles from './AuthLayout.module.css';

export interface AuthLayoutProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
  /** Footer row under the form (links such as "Sign up" / "Back to login"). */
  readonly footer?: ReactNode;
}

/** Split-screen auth shell: a focused form card on the left, the marketing panel on the right. */
export const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps): ReactElement => (
  <main className={styles.screen}>
    <section className={styles.panel}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>UA</span>
        <span>UAPP Academy</span>
      </div>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
        {children}
      </div>
      {footer !== undefined ? <div className={styles.footer}>{footer}</div> : null}
    </section>
    <AuthAside />
  </main>
);
