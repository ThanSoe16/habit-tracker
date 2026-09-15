'use client';
import { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSavingsHistory } from '@/features/savings/services/queries';
import { SAVINGS_PAGE_SIZE } from '@/features/savings/services/savings-service';
import type { SavingsGoal } from '@/features/savings/types';
import { formatCurrency } from '@/features/budget/store/model';

export function SavingsHistoryDialog({
  goal,
  onClose,
}: {
  goal: SavingsGoal;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const query = useSavingsHistory(goal.id, page);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-dvh overflow-y-auto rounded-3xl p-6 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold tracking-tight">
            Savings history
          </DialogTitle>
          <DialogDescription>
            {goal.name} · {goal.currency}
          </DialogDescription>
        </DialogHeader>
        {query.isPending && <Skeleton className="h-32" />}
        {query.isError && (
          <Flex className="flex flex-col gap-2">
            <p role="alert" className="text-sm text-destructive">
              Could not refresh savings history.
            </p>
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </Flex>
        )}
        {query.data && (
          <Flex className="flex flex-col gap-3">
            {query.data.rows.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No transactions yet. Add money to start saving.
              </p>
            )}
            {query.data.rows.map((entry) => (
              <Flex key={entry.id} className="flex flex-col gap-1 border-b border-border pb-3">
                <Flex className="flex justify-between gap-2">
                  <p className="text-sm font-medium">
                    {entry.kind === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    {entry.person ? ` from ${entry.person}` : ''}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {entry.kind === 'deposit' ? '+' : '−'}
                    {formatCurrency(entry.amount, goal.currency)}
                  </p>
                </Flex>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                  {entry.kind === 'withdrawal'
                    ? entry.to_budget
                      ? ' · Added to budget'
                      : ' · Outside budget'
                    : ''}
                </p>
                {entry.note && (
                  <p className="text-sm text-muted-foreground break-words">{entry.note}</p>
                )}
              </Flex>
            ))}
            <Flex className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * SAVINGS_PAGE_SIZE >= query.data.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </DialogContent>
    </Dialog>
  );
}
