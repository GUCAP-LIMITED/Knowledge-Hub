import { useEffect, useMemo, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMyPermissions } from '@features/permissions';
import type {
  Certificate,
  CertificateListQuery,
  CertificateListResult,
  CertificateRoleSummary,
  CertificateStatisticsOverview,
} from '../domain';
import { useCertificateStatistics, useCertificates } from './use-certificates';
import { useCertificatesModule } from './use-certificates-module';
import type { FilterSelection } from './CertRolePills';

const PAGE_SIZE = 12;

const deriveQueryParams = (
  selection: FilterSelection,
  isAdmin: boolean,
  page: number,
  search: string,
): CertificateListQuery => {
  const trimmed = search.trim();
  return {
    isSelf: selection.type === 'me' || !isAdmin,
    userTypeId: selection.type === 'role' ? selection.userTypeId : undefined,
    filter: trimmed.length > 0 ? trimmed : undefined,
    skipCount: (page - 1) * PAGE_SIZE,
    maxResultCount: PAGE_SIZE,
  };
};

const extractCertificateCounts = (
  data: CertificateListResult | undefined,
  statisticsData: CertificateStatisticsOverview | undefined,
): {
  readonly totalCount: number;
  readonly myTotal: number;
  readonly items: readonly Certificate[];
  readonly totalPages: number;
  readonly allCount: number;
} => {
  const totalCount = data?.totalCount ?? 0;
  const myTotal = data?.myTotalCertificates ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const allCount = statisticsData?.totalIssuedCertificates ?? totalCount;
  return { totalCount, myTotal, items, totalPages, allCount };
};

const resolveSubtitleCount = (
  isSelf: boolean,
  issuedCount: number | undefined,
  myCount: number,
  totalCount: number,
): number => {
  if (isSelf) {
    return myCount;
  }
  return issuedCount ?? totalCount;
};

export interface CertificatesPageState {
  readonly isAdmin: boolean;
  readonly search: string;
  readonly selection: FilterSelection;
  readonly page: number;
  readonly active: Certificate | null;
  readonly now: Date;
  readonly filter: string | undefined;
  readonly roles: readonly CertificateRoleSummary[];
  readonly allCount: number;
  readonly myCount: number;
  readonly showAll: boolean;
  readonly totalCount: number;
  readonly myTotal: number;
  readonly items: readonly Certificate[];
  readonly totalPages: number;
  readonly subtitleCount: number;
  readonly isSelfView: boolean;
  readonly statistics: UseQueryResult<CertificateStatisticsOverview>;
  readonly certificates: UseQueryResult<CertificateListResult>;
  readonly handleSearch: (v: string) => void;
  readonly handleSelect: (selection: FilterSelection) => void;
  readonly setPage: (p: number) => void;
  readonly setActive: (cert: Certificate | null) => void;
  readonly handleCloseModal: () => void;
}

/** Presentation state and queries for the CertificatesPage. */
export const useCertificatesPage = (): CertificatesPageState => {
  const { clock } = useCertificatesModule();
  const { data: permissions } = useMyPermissions();
  const isAdmin = permissions?.['Certificates.Issue'] === true;

  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<FilterSelection>(() =>
    isAdmin ? { type: 'all' } : { type: 'me' },
  );
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Certificate | null>(null);

  const now = useMemo(() => clock.now(), [clock]);
  const statistics = useCertificateStatistics(undefined, isAdmin);

  // If statistics fails (e.g. 403 Forbidden or network error), fallback to "For Me"
  useEffect(() => {
    if (statistics.isError) {
      setSelection({ type: 'me' });
    }
  }, [statistics.isError]);

  const queryParams = deriveQueryParams(selection, isAdmin, page, search);
  const certificates = useCertificates(queryParams);

  const roles = statistics.data?.roles ?? [];
  const { totalCount, myTotal, items, totalPages, allCount } = extractCertificateCounts(
    certificates.data,
    statistics.data,
  );

  const isSelf = queryParams.isSelf === true;
  const subtitleCount = resolveSubtitleCount(
    isSelf,
    statistics.data?.totalIssuedCertificates,
    myTotal,
    totalCount,
  );

  const handleSearch = (v: string): void => {
    setSearch(v);
    setPage(1);
  };

  const handleSelect = (next: FilterSelection): void => {
    setSelection(next);
    setPage(1);
  };

  const handleCloseModal = (): void => {
    setActive(null);
  };

  return {
    isAdmin,
    search,
    selection,
    page,
    active,
    now,
    filter: queryParams.filter,
    roles,
    allCount,
    myCount: myTotal,
    showAll: isAdmin && !statistics.isError,
    totalCount,
    myTotal,
    items,
    totalPages,
    subtitleCount,
    isSelfView: isSelf,
    statistics,
    certificates,
    handleSearch,
    handleSelect,
    setPage,
    setActive,
    handleCloseModal,
  };
};
