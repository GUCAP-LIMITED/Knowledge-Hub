import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { Button, PageHeader } from '@shared/ui';

export interface SubmissionsPageHeaderProps {
  readonly isAdmin: boolean;
  readonly canUpload: boolean;
}

export const SubmissionsPageHeader = ({
  isAdmin,
  canUpload,
}: SubmissionsPageHeaderProps): ReactElement => (
  <PageHeader
    title="My Submissions"
    subtitle={
      isAdmin
        ? 'Published content across the platform'
        : 'Track the status of your submissions'
    }
  >
    {canUpload ? (
      <Button asChild size="sm">
        <Link to="/upload">
          <Upload aria-hidden="true" /> Upload document
        </Link>
      </Button>
    ) : null}
  </PageHeader>
);
