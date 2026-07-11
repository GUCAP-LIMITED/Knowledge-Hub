import type { ReactElement } from 'react';
import { ErrorLayout } from './ErrorLayout';

export const NotFoundPage = (): ReactElement => (
  <ErrorLayout
    code="404"
    title="Page not found"
    message="The page you’re looking for doesn’t exist or may have moved."
  />
);
