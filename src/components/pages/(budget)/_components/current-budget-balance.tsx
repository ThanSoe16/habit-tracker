'use client';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSavingsBalances } from '@/features/savings/services/queries';
import { getSavingsBalance } from '@/features/savings/types';
import { formatCurrency, type CurrencyCode } from '@/features/budget/store/model';
import { getCurrentBalance } from '@/features/budget/utils/current-balance';
import { useFundMonth } from '@/features/relationship-funds/services/queries';
import { getFundSummary } from '@/features/relationship-funds/types';
import { RelationshipFundBalance } from './relationship-fund-balance';

export function CurrentBudgetBalance({
  currency,
  spendable,
}: {
  currency: CurrencyCode;
  spendable: number;
}) {
  const savings = useSavingsBalances();
  const fund = useFundMonth(null);
  const reserved = savings.data ? getSavingsBalance(savings.data, currency) : null;
  const relationshipFunds = fund.data ? getFundSummary(fund.data).remaining : null;
  const total = getCurrentBalance(spendable, reserved, relationshipFunds, currency);
  return (
    <Flex className="flex flex-col items-center gap-2" aria-live="polite">
      {total !== null ? (
        <h2 className="text-4xl font-black tracking-tight tabular-nums">
          {formatCurrency(total, currency)}
        </h2>
      ) : savings.isPending || (currency === 'MMK' && fund.isPending) ? (
        <Skeleton className="h-10 w-64 max-w-full" />
      ) : (
        <p className="text-sm text-muted-foreground">Current balance unavailable</p>
      )}
      <Flex className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
        <span>Available: {formatCurrency(spendable, currency)}</span>
        {reserved !== null ? (
          <span>In savings: {formatCurrency(reserved, currency)}</span>
        ) : savings.isPending ? (
          <Flex className="flex items-center gap-1" role="status">
            <span>In savings:</span>
            <Skeleton className="h-3 w-20" aria-label="Loading savings balance" />
          </Flex>
        ) : (
          <span>In savings: unavailable</span>
        )}
      </Flex>
      <RelationshipFundBalance fund={fund} remaining={relationshipFunds} />
      {savings.isError && (
        <Flex className="flex flex-col items-center gap-1">
          <p role="alert" className="text-xs text-destructive">
            Could not refresh the savings total.
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={savings.isFetching}
            onClick={() => void savings.refetch()}
          >
            {savings.isFetching ? 'Refreshing…' : 'Try again'}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
