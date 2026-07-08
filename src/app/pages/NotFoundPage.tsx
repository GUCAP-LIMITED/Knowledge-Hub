import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = (): ReactElement => {
  return (
    <main
      style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', gap: '0.5rem' }}
    >
      <h1 style={{ margin: 0 }}>404</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>This page could not be found.</p>
      <Link to="/">Go home</Link>
    </main>
  );
};
