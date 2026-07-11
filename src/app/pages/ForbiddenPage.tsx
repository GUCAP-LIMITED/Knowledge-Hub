import type { ReactElement } from 'react';
import { ErrorLayout } from './ErrorLayout';

export const ForbiddenPage = (): ReactElement => (
  <ErrorLayout
    code="403"
    title="Access denied"
    message="You don’t have permission to view this page. Contact an admin if you think this is a mistake."
  />
);
