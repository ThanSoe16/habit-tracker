'use client';

import React from 'react';
import { Flex } from '@radix-ui/themes';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<T> {
  columns: Array<{
    accessorKey?: string;
    header: string | (() => React.ReactNode);
    cell: (info: { row: { original: T } }) => React.ReactNode;
  }>;
  data: T[];
  total?: number;
  query?: {
    pageIndex: number;
    rowPerPage: number;
  };
  isLoading?: boolean;
  renderHeader?: () => React.ReactNode;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  total = 0,
  query = { pageIndex: 1, rowPerPage: 10 },
  isLoading = false,
  renderHeader,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = Math.ceil((total || data.length) / query.rowPerPage) || 1;

  return (
    <Flex direction="column" gap="4" className="w-full">
      {renderHeader && renderHeader()}

      <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase text-muted-foreground">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3">
                  {typeof col.header === 'function' ? col.header() : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3">
                      <Skeleton className="h-5 w-full rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3">
                      {col.cell({ row: { original: row } })}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Flex justify="between" align="center" className="px-2 py-1">
          <span className="text-xs font-semibold text-muted-foreground">
            Page {query.pageIndex} of {totalPages}
          </span>
          <Flex gap="2">
            <Button
              variant="outline"
              size="icon"
              disabled={query.pageIndex <= 1 || isLoading}
              onClick={() => onPageChange && onPageChange(query.pageIndex - 1)}
              className="w-8 h-8 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={query.pageIndex >= totalPages || isLoading}
              onClick={() => onPageChange && onPageChange(query.pageIndex + 1)}
              className="w-8 h-8 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

export default DataTable;
