import { useState } from 'react';

export interface DirectoryFilters {
  readonly branchId: string | null;
  readonly userTypeId: string | null;
  readonly search: string;
  /** Zero-based page index. */
  readonly page: number;
  readonly setBranchId: (value: string | null) => void;
  readonly setUserTypeId: (value: string | null) => void;
  readonly setSearch: (value: string) => void;
  readonly setPage: (value: number) => void;
}

/** Directory filter state; changing any filter returns to the first page. */
export const useDirectoryFilters = (): DirectoryFilters => {
  const [branchId, setBranch] = useState<string | null>(null);
  const [userTypeId, setUserType] = useState<string | null>(null);
  const [search, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  return {
    branchId,
    userTypeId,
    search,
    page,
    setBranchId: (value) => {
      setBranch(value);
      setPage(0);
    },
    setUserTypeId: (value) => {
      setUserType(value);
      setPage(0);
    },
    setSearch: (value) => {
      setSearchText(value);
      setPage(0);
    },
    setPage,
  };
};
