import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { UserTypesManager } from './UserTypesManager';
import styles from './UserTypesPage.module.css';

/**
 * User-type management: create custom types, view the seniority chain / data scope, and delete
 * custom types in the hierarchy. Adopted from the Lead project in-page experience.
 */
export const UserTypesPage = (): ReactElement => (
  <main className={styles.screen}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link to="/settings/users" className={styles.backLink} aria-label="Back to Users">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Users</span>
      </Link>
    </nav>
    <header className={styles.pageHeader}>
      <div className={styles.headerIcon} aria-hidden="true">
        <Settings size={22} />
      </div>
      <div className={styles.headerText}>
        <h1 className={styles.headerTitle}>Manage User Types</h1>
        <p className={styles.headerSubtitle}>
          Create or remove custom user types in the hierarchy
        </p>
      </div>
    </header>
    <UserTypesManager />
  </main>
);
