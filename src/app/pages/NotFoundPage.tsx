import type { ReactElement } from 'react';
import { Compass } from 'lucide-react';
import { ErrorLayout } from './ErrorLayout';

export const NotFoundPage = (): ReactElement => (
  <ErrorLayout
    icon={Compass}
    code="404"
    title="Page not found"
    message="The page you’re looking for doesn’t exist or may have moved."
  />
);
