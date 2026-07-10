import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Alert, Skeleton } from '@shared/ui';
import { useCourse } from '@features/courses';
import { CourseDetailView } from './CourseDetailView';
import styles from './CourseDetailPage.module.css';

/** Rich course detail: hero, outcomes, curriculum, quiz-gated certificate, reviews and sidebar. */
export const CourseDetailPage = (): ReactElement => {
  const params = useParams();
  const id = params.id ?? '';
  const course = useCourse(id);

  const backLink = (
    <Link to="/courses" className={styles.back}>
      <ArrowLeft size={15} aria-hidden="true" /> Back to catalog
    </Link>
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
    return (
      <section className={styles.screen}>
        {backLink}
        <Alert tone="error" title="Course not found">
          {course.error?.message ?? 'This course could not be loaded.'}
        </Alert>
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      {backLink}
      <CourseDetailView course={course.data} />
    </section>
  );
};
