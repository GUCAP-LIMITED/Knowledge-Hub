import type { ContentTypeKey } from '../domain/types';

export interface LearningRouteTarget {
  readonly contentType: ContentTypeKey;
  readonly id: string;
  readonly slug?: string | null | undefined;
}

/**
 * Resolves the client-side SPA route for any learning item.
 * Decouples presentation navigation from the backend API.
 * - Courses: /courses/:id or :slug (Course Detail page manages lesson resumption)
 * - Tutorials: /tutorials/:id or :slug
 * - Resources: /resources/:id or :slug
 */
export const getLearningItemRoute = (item: LearningRouteTarget): string => {
  const target = item.slug ?? item.id;
  switch (item.contentType) {
    case 'course':
      return `/courses/${target}`;
    case 'tutorial':
      return `/tutorials/${target}`;
    case 'resource':
      return `/resources/${target}`;
    default:
      return `/courses/${target}`;
  }
};
