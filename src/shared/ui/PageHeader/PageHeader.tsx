import type { ReactElement, ReactNode } from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly breadcrumb?: ReactNode;
  /** Right-aligned actions (buttons, filters). */
  readonly children?: ReactNode;
}

/** Consistent page title block with an optional breadcrumb and right-aligned actions. */
export const PageHeader = ({
  title,
  subtitle,
  breadcrumb,
  children,
}: PageHeaderProps): ReactElement => (
  <header className={styles.header}>
    <div className={styles.headings}>
      {breadcrumb !== undefined ? (
        <div className={styles.breadcrumb}>{breadcrumb}</div>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
      {subtitle !== undefined ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
    {children !== undefined ? <div className={styles.actions}>{children}</div> : null}
  </header>
);
