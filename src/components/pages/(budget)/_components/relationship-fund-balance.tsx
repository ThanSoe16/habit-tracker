'use client';

import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/features/budget/store/model';
import type { UseQueryResult } from '@tanstack/react-query';
import type { FundTransaction } from '@/features/relationship-funds/types';

export function RelationshipFundBalance({
  fund,
  remaining,
}: {
  fund: UseQueryResult<FundTransaction[]>;
  remaining: number | null;
}) {
  return (
    <Flex className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground">
      {remaining !== null ? (
        <span>Relationship funds: {formatCurrency(remaining, 'MMK')}</span>
      ) : fund.isPending ? (
        <Flex className="flex items-center gap-1" role="status">
          <span>Relationship funds:</span>
          <Skeleton className="h-3 w-20" aria-label="Loading relationship fund balance" />
        </Flex>
      ) : null}
      {fund.isError && (
        <>
          <p role="alert" className="text-xs text-destructive">
            Could not refresh the relationship fund balance.
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={fund.isFetching}
            onClick={() => void fund.refetch()}
          >
            {fund.isFetching ? 'Refreshing…' : 'Retry relationship funds'}
          </Button>
        </>
      )}
    </Flex>
  );
}
