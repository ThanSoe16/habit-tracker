'use client';

import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';

export function usePagination() {
  const [rawPageIndex, setPageIndex] = useQueryState('pageIndex', parseAsInteger.withDefault(1));
  const [rawRowPerPage, setRowPerPage] = useQueryState(
    'rowPerPage',
    parseAsInteger.withDefault(10),
  );
  const pageIndex = Math.max(1, rawPageIndex);
  const rowPerPage = Math.min(100, Math.max(1, rawRowPerPage));
  const [word, setWord] = useQueryState('word', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault('ALL'));
  const [departmentId, setDepartmentId] = useQueryState(
    'departmentId',
    parseAsString.withDefault(''),
  );
  const [positionId, setPositionId] = useQueryState('positionId', parseAsString.withDefault(''));
  const [cursor, setCursor] = useQueryState('cursor', parseAsString.withDefault(''));

  const handleSearchChange = (val: string) => {
    setWord(val || null);
    setPageIndex(1);
    setCursor(null);
  };

  const handlePageChange = (page: number) => {
    setPageIndex(Number.isSafeInteger(page) ? Math.max(1, page) : 1);
    setCursor(null);
  };

  const handleRowPerPageChange = (size: number) => {
    setRowPerPage(Number.isSafeInteger(size) ? Math.min(100, Math.max(1, size)) : 10);
    setPageIndex(1);
    setCursor(null);
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
      setCursor(null);
    },
    departmentId: departmentId || '',
    setDepartmentId: (val: string) => {
      setDepartmentId(val || null);
      setPageIndex(1);
      setCursor(null);
    },
    positionId: positionId || '',
    setPositionId: (val: string) => {
      setPositionId(val || null);
      setPageIndex(1);
      setCursor(null);
    },
  };
}
