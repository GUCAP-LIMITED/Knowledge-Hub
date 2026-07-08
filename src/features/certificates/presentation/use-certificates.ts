import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Certificate } from '../domain';
import { useCertificatesModule } from './use-certificates-module';

/** Stable query key for the issued certificates. */
export const certificatesQueryKey = ['certificates'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useCertificates = (): UseQueryResult<readonly Certificate[]> => {
  const { listCertificates } = useCertificatesModule();

  return useQuery({
    queryKey: certificatesQueryKey,
    queryFn: async (): Promise<readonly Certificate[]> => {
      const result = await listCertificates.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};
