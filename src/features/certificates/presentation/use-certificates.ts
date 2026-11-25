import { useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type {
  Certificate,
  CertificateListQuery,
  CertificateListResult,
  CertificateStatisticsOverview,
} from '../domain';
import { useCertificatesModule } from './use-certificates-module';
import { CertificatesModuleContext } from './certificates-module-context';

/** Query key factory for the certificates feature. */
export const certificateKeys = {
  all: ['certificates'] as const,
  statistics: (branchId?: string) =>
    ['certificates', 'statistics', branchId ?? 'current'] as const,
  list: (query?: CertificateListQuery) => ['certificates', 'list', query ?? {}] as const,
  detail: (id: string) => ['certificates', 'detail', id] as const,
};

/** Backward-compatible stable query key. */
export const certificatesQueryKey = certificateKeys.all;

/** Fetch high-level certificate analytics overview with team/role breakdowns. */
export const useCertificateStatistics = (
  branchId?: string,
  enabled = true,
): UseQueryResult<CertificateStatisticsOverview> => {
  const { getCertificateStatisticsOverview } = useCertificatesModule();

  return useQuery({
    queryKey: certificateKeys.statistics(branchId),
    queryFn: async (): Promise<CertificateStatisticsOverview> => {
      const result = await getCertificateStatisticsOverview.execute(branchId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    enabled,
    retry: false,
  });
};

/** Paginated list query. Unwraps the domain Result, throwing AppError so Query surfaces it. */
export const useCertificates = (
  query?: CertificateListQuery,
): UseQueryResult<CertificateListResult> => {
  const { listCertificates } = useCertificatesModule();

  return useQuery({
    queryKey: certificateKeys.list(query),
    queryFn: async (): Promise<CertificateListResult> => {
      const result = await listCertificates.execute(query);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** Fetch a single certificate by id. Disabled while `id` is `null` (nothing selected yet). */
export const useCertificate = (id: string | null): UseQueryResult<Certificate> => {
  const certModule = useContext(CertificatesModuleContext);

  return useQuery({
    queryKey: certificateKeys.detail(id ?? ''),
    queryFn: async (): Promise<Certificate> => {
      if (certModule === null) {
        throw new Error(
          'Certificates hooks must be used within <CertificatesModuleProvider>.',
        );
      }
      const result = await certModule.getCertificate.execute(id ?? '');
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    enabled: id !== null && certModule !== null,
  });
};
