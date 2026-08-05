'use client';

import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';

export function usePagination() {
  const [pageIndex, setPageIndex] = useQueryState('pageIndex', parseAsInteger.withDefault(1));
  const [rowPerPage, setRowPerPage] = useQueryState('rowPerPage', parseAsInteger.withDefault(10));
  const [word, setWord] = useQueryState('word', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault('ALL'));
  const [departmentId, setDepartmentId] = useQueryState('departmentId', parseAsString.withDefault(''));
  const [positionId, setPositionId] = useQueryState('positionId', parseAsString.withDefault(''));
  const [cursor, setCursor] = useQueryState('cursor', parseAsString.withDefault(''));

  const handleSearchChange = (val: string) => {
    setWord(val || null);
    setPageIndex(1);
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handleRowPerPageChange = (size: number) => {
    setRowPerPage(size);
    setPageIndex(1);
  };

  return {
    query: {
      pageIndex,
      rowPerPage,
      word,
      cursor,
    },
    pageIndex,
    setPageIndex: handlePageChange,
    rowPerPage,
    setRowPerPage: handleRowPerPageChange,
    word,
    handleSearchChange,
    status: status || 'ALL',
    setStatus: (val: string) => {
      setStatus(val === 'ALL' ? null : val);
      setPageIndex(1);
    },
    departmentId: departmentId || '',
    setDepartmentId: (val: string) => {
      setDepartmentId(val || null);
      setPageIndex(1);
    },
    positionId: positionId || '',
    setPositionId: (val: string) => {
      setPositionId(val || null);
      setPageIndex(1);
    },
  };
}
