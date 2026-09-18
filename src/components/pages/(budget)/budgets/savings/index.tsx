'use client';
import { useEffect, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Flex } from '@radix-ui/themes';
import { PiggyBank, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { useBudgetStore } from '@/store/use-budget-store';
import { useSavings } from '@/features/savings/services/queries';
import { SAVINGS_PAGE_SIZE } from '@/features/savings/services/savings-service';
import type { SavingsGoal } from '@/features/savings/types';
import { SavingsCard } from './_components/savings-card';
import { CreateSavingsDialog } from './_components/create-savings-dialog';
import { SavingsTransactionDialog } from './_components/savings-transaction-dialog';
import { SavingsHistoryDialog } from './_components/savings-history-dialog';

export default function SavingsPage() {
  const userId = useQueryIdentity();
  const currency = useBudgetStore((state) => state.currency);
  const [requestedPage, setPage] = useQueryState('savingsPage', parseAsInteger.withDefault(1));
  const page = Math.max(1, Math.min(100000, requestedPage));
  const query = useSavings(page);
  const [creating, setCreating] = useState(false);
  const [action, setAction] = useState<{
    goal: SavingsGoal;
    kind: 'deposit' | 'withdrawal' | 'history';
  } | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const lastPage = query.data ? Math.max(1, Math.ceil(query.data.total / SAVINGS_PAGE_SIZE)) : page;
  useEffect(() => {
    if (page > lastPage || requestedPage !== page) void setPage(Math.min(page, lastPage));
  }, [page, requestedPage, lastPage, setPage]);
  return (
    <Flex className="flex flex-col gap-5">
      <Flex className="flex items-center justify-between gap-3">
        <Flex className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight">Savings</h2>
          <p className="text-xs font-medium text-muted-foreground">Money set aside for later.</p>
        </Flex>
        <Button
          size="lg"
          className="rounded-full px-4"
          onClick={() => setCreating(true)}
          disabled={!userId}
        >
          <Plus data-icon="inline-start" />
          New saving
        </Button>
      </Flex>
      <Card className="rounded-3xl py-5 shadow-sm">
        <CardHeader className="px-5">
          <Flex className="flex items-start gap-3">
            <Flex className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PiggyBank className="size-5" />
            </Flex>
            <Flex className="flex min-w-0 flex-col gap-1.5">
              <CardTitle className="text-sm font-extrabold">
                Savings are separate from Available
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Adding money here increases In savings and your total Current Balance.
                Withdrawing reduces both. Your Available amount stays unchanged.
              </CardDescription>
            </Flex>
          </Flex>
        </CardHeader>
      </Card>
      {query.isPending && (
        <Flex className="flex flex-col gap-3">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </Flex>
      )}
      {query.isError && (
        <Flex className="flex flex-col gap-2">
          <p role="alert" className="text-sm text-destructive">
            Could not load savings. Please try again.
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </Flex>
      )}
      {query.data?.total === 0 && (
        <Card className="rounded-3xl py-8 text-center shadow-sm">
          <CardHeader className="justify-items-center gap-3 px-6">
            <Flex className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <PiggyBank className="size-7" />
            </Flex>
            <CardTitle className="font-extrabold">Start your first saving</CardTitle>
            <CardDescription className="max-w-xs text-xs leading-relaxed">
              Save money from Mom, or set something aside for yourself. Choose an amount or date to
              unlock it.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-4"
              onClick={() => setCreating(true)}
            >
              <Plus data-icon="inline-start" />
              Create a saving
            </Button>
          </CardContent>
        </Card>
      )}
      {query.data?.rows.map((goal) => (
        <SavingsCard
          key={goal.id}
          goal={goal}
          now={now}
          onAction={(kind) => setAction({ goal, kind })}
        />
      ))}
      {query.data && query.data.total > SAVINGS_PAGE_SIZE && (
        <Flex className="flex items-center justify-between gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => void setPage(page - 1)}>
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </p>
          <Button
            variant="outline"
            disabled={page >= lastPage}
            onClick={() => void setPage(page + 1)}
          >
            Next
          </Button>
        </Flex>
      )}
      {creating && (
        <CreateSavingsDialog
          key={userId}
          currency={currency}
          onClose={() => {
            setCreating(false);
            void setPage(1);
          }}
        />
      )}
      {action?.kind === 'history' && (
        <SavingsHistoryDialog
          key={`${userId}:${action.goal.id}`}
          goal={action.goal}
          onClose={() => setAction(null)}
        />
      )}
      {action && action.kind !== 'history' && (
        <SavingsTransactionDialog
          key={`${userId}:${action.goal.id}:${action.kind}`}
          goal={action.goal}
          kind={action.kind}
          onClose={() => setAction(null)}
        />
      )}
    </Flex>
  );
}
