import { useEffect, type ReactElement } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Alert, Button, Skeleton } from '@shared/ui';
import { useResource } from '@features/resources';
import { useCanAccessRoute } from '@features/permissions';
import { ResourceDetailView } from './ResourceDetailView';
import styles from './ResourceDetailPage.module.css';

/**
 * Routed Resource detail page: hero overview, attached documents list,
 * interactive viewer modal, and integrated reviews.
 */
export const ResourceDetailPage = (): ReactElement => {
  const params = useParams();
  const id = params.id ?? '';
  const resource = useResource(id);
  const navigate = useNavigate();
  const location = useLocation();
  const canAccessCatalog = useCanAccessRoute('/resources');
  const backTarget = canAccessCatalog ? '/resources' : '/my-learning';
  const backLabel = canAccessCatalog ? 'Back to resources' : 'Back to My Learning';

  useEffect(() => {
    if (resource.data?.slug && id !== resource.data.slug) {
      navigate(`/resources/${resource.data.slug}${location.search}`, { replace: true });
    }
  }, [resource.data?.slug, id, navigate, location.search]);

  const backLink = (
    <Button asChild variant="ghost" size="sm" className={styles.back}>
      <Link to={backTarget}>
        <ArrowLeft aria-hidden="true" /> {backLabel}
      </Link>
    </Button>
  );

  if (resource.isLoading) {
    return (
      <section className={styles.screen}>
        {backLink}
        <Skeleton height={220} radius={20} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          <Skeleton height={350} radius={16} />
          <Skeleton height={280} radius={16} />
        </div>
      </section>
    );
  }

  if (resource.isError || resource.data === undefined) {
    return (
      <section className={styles.screen}>
        {backLink}
        <Alert tone="error" title="Resource not found">
          {resource.error?.message ?? 'This resource could not be loaded.'}
        </Alert>
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <ResourceDetailView resource={resource.data} />
    </section>
  );
};
