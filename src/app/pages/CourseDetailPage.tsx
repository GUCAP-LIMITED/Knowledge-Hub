import { useEffect, type ReactElement } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookX, GraduationCap } from 'lucide-react';
import { Button, Skeleton } from '@shared/ui';
import { useCourse, CourseNotFoundError } from '@features/courses';
import { useCanAccessRoute } from '@features/permissions';
import { CourseDetailView } from './CourseDetailView';
import { ErrorLayout } from './ErrorLayout';
import styles from './CourseDetailPage.module.css';

/** Falls back to My Learning when the learner no longer holds the catalog permission. */
const resolveBackLink = (
  canAccessCatalog: boolean,
): { readonly to: string; readonly label: string } =>
  canAccessCatalog
    ? { to: '/courses', label: 'Back to catalog' }
    : { to: '/my-learning', label: 'Back to My Learning' };

/** Rich course detail: hero, outcomes, curriculum, quiz-gated certificate, reviews and sidebar. */
export const CourseDetailPage = (): ReactElement => {
  const params = useParams();
  const id = params.id ?? '';
  const course = useCourse(id);
  const navigate = useNavigate();
  const location = useLocation();
  const back = resolveBackLink(useCanAccessRoute('/courses'));

  useEffect(() => {
    if (course.data?.slug && id !== course.data.slug) {
      navigate(`/courses/${course.data.slug}${location.search}`, { replace: true });
    }
  }, [course.data?.slug, id, navigate, location.search]);

  const backLink = (
    <Button asChild variant="ghost" size="sm" className={styles.back}>
      <Link to={back.to}>
        <ArrowLeft aria-hidden="true" /> {back.label}
      </Link>
    </Button>
  );

  if (course.isLoading) {
    return (
      <section className={styles.screen}>
        {backLink}
        <Skeleton height={200} radius={20} />
      </section>
    );
  }
  if (course.isError || course.data === undefined) {
    const isNotFound = course.error instanceof CourseNotFoundError;
    return (
      <ErrorLayout
        code={isNotFound ? '404' : undefined}
        icon={isNotFound ? BookX : GraduationCap}
        title={isNotFound ? 'Course not found' : 'Course unavailable'}
        message={
          isNotFound
            ? 'This link doesn’t match any course — it may have been removed, unpublished, or the link is incorrect.'
            : (course.error?.message ?? 'This course could not be loaded right now.')
        }
        actionTo={back.to}
        actionLabel={back.label}
      />
    );
  }

  return (
    <section className={styles.screen}>
      <CourseDetailView course={course.data} />
    </section>
  );
};
