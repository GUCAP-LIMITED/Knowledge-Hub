import type { QueryClient } from '@tanstack/react-query';
import { certificateKeys } from '@features/certificates';
import { myLearningQueryKey } from './use-infinite-my-learning';

/**
 * Refreshes the learner-facing aggregates that a completion/enrollment mutation can invalidate.
 * Kept in one place so course, tutorial, and resource mutations cannot drift apart.
 */
export const invalidateLearningCaches = async (
  queryClient: QueryClient,
  options?: { readonly includeCertificates?: boolean },
): Promise<void> => {
  const tasks: Promise<void>[] = [
    queryClient.invalidateQueries({ queryKey: myLearningQueryKey }),
  ];

  if (options?.includeCertificates === true) {
    tasks.push(queryClient.invalidateQueries({ queryKey: certificateKeys.all }));
  }

  await Promise.all(tasks);
};
