'use client';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSavingsBalances } from '@/features/savings/services/queries';
import { getSavingsBalance } from '@/features/savings/types';
import { formatCurrency, type CurrencyCode } from '@/features/budget/store/model';

export function CurrentBudgetBalance({
  currency,
  spendable,
}: {
  currency: CurrencyCode;
  spendable: number;
}) {
  const savings = useSavingsBalances();
  const reserved = savings.data ? getSavingsBalance(savings.data, currency) : null;
  return (
    <Flex className="flex flex-col items-center gap-2" aria-live="polite">
      {reserved !== null ? (
        <>
          <h2 className="text-4xl font-black tracking-tight tabular-nums">
            {formatCurrency(spendable + reserved, currency)}
          </h2>
          <Flex className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
            <span>Available: {formatCurrency(spendable, currency)}</span>
            <span>In savings: {formatCurrency(reserved, currency)}</span>
          </Flex>
        </>
      ) : savings.isPending ? (
        <Skeleton className="h-10 w-64 max-w-full" />
      ) : (
        <p className="text-sm text-muted-foreground">Current balance unavailable</p>
      )}
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
