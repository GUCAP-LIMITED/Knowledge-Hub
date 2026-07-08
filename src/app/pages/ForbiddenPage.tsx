import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export const ForbiddenPage = (): ReactElement => {
  return (
    <main
      style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', gap: '0.5rem' }}
    >
      <h1 style={{ margin: 0 }}>403</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        You do not have permission to view this page.
      </p>
      <Link to="/">Go home</Link>
    </main>
  );
};
