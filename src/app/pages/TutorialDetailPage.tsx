import { useEffect, type ReactElement } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Alert, Button, Skeleton } from '@shared/ui';
import { useTutorial } from '@features/tutorials';
import { useCanAccessRoute } from '@features/permissions';
import { TutorialDetailView } from './TutorialDetailView';
import styles from './TutorialDetailPage.module.css';

/** Routed tutorial detail: header, video/quiz content, reviews, and a details sidebar. */
export const TutorialDetailPage = (): ReactElement => {
  const params = useParams();
  const id = params.id ?? '';
  const tutorial = useTutorial(id);
  const navigate = useNavigate();
  const location = useLocation();
  const canAccessCatalog = useCanAccessRoute('/tutorials');
  const backTarget = canAccessCatalog ? '/tutorials' : '/my-learning';
  const backLabel = canAccessCatalog ? 'Back to tutorials' : 'Back to My Learning';

  useEffect(() => {
    if (tutorial.data?.slug && id !== tutorial.data.slug) {
      navigate(`/tutorials/${tutorial.data.slug}${location.search}`, { replace: true });
    }
  }, [tutorial.data?.slug, id, navigate, location.search]);

  const backLink = (
    <Button asChild variant="ghost" size="sm" className={styles.back}>
      <Link to={backTarget}>
        <ArrowLeft aria-hidden="true" /> {backLabel}
      </Link>
    </Button>
  );

  if (tutorial.isLoading) {
    return (
      <section className={styles.screen}>
        {backLink}
        <Skeleton height={200} radius={20} />
      </section>
    );
  }
  if (tutorial.isError || tutorial.data === undefined) {
    return (
      <section className={styles.screen}>
        {backLink}
        <Alert tone="error" title="Tutorial not found">
          {tutorial.error?.message ?? 'This tutorial could not be loaded.'}
        </Alert>
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <TutorialDetailView tutorial={tutorial.data} />
    </section>
  );
};
