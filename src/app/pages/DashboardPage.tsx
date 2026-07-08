import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@features/auth';
import styles from './DashboardPage.module.css';

interface QuickLink {
  readonly to: string;
  readonly title: string;
  readonly description: string;
}

const QUICK_LINKS: readonly QuickLink[] = [
  {
    to: '/courses',
    title: 'Course Catalog',
    description: 'Structured, multi-lesson learning paths.',
  },
  { to: '/tutorials', title: 'Tutorials', description: 'Short, focused how-to videos.' },
  {
    to: '/resources',
    title: 'Resources',
    description: 'Guides, policies and reference material.',
  },
  { to: '/certificates', title: 'Certificates', description: 'Your earned credentials.' },
];

/** App landing page. Greets the learner and links into each area of the Knowledge Hub. */
export const DashboardPage = (): ReactElement => {
  const { user } = useAuth();
  const firstName = (user?.fullName ?? 'there').split(' ')[0];

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Knowledge Hub</p>
        <h1 className={styles.title}>Welcome back, {firstName}.</h1>
        <p className={styles.subtitle}>
          Pick up where you left off, or explore something new.
        </p>
      </header>

      <div className={styles.grid}>
        {QUICK_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className={styles.card}>
            <h2 className={styles.cardTitle}>{link.title}</h2>
            <p className={styles.cardDescription}>{link.description}</p>
            <span className={styles.cardCta}>Open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
};
