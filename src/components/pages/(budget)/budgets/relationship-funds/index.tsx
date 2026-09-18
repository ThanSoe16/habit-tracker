'use client';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Flex } from '@radix-ui/themes';
import { Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { useSubmissionScope } from '@/features/base/hooks/use-submission-scope';
import { useFundMonth } from '@/features/relationship-funds/services/queries';
import { useDeleteFundTransaction } from '@/features/relationship-funds/services/mutations';
import { type FundTransaction } from '@/features/relationship-funds/types';
import { FundTransactionDialog } from './_components/fund-transaction-dialog';
import { toast } from 'sonner';
import { DataRequestError } from '@/lib/supabase/request';
import { FundSummaryCard } from './_components/fund-summary-card';
import { FundTransactionRow } from './_components/fund-transaction-row';
import { ExportTableModal } from '../../_components/export-table-modal';
import styles from './relationship-funds.module.css';

const PAGE_SIZE = 10;
export default function RelationshipFundsPage() {
  const userId = useQueryIdentity();
  const scope = useSubmissionScope();
  const [today, setToday] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  useEffect(() => {
    const timer = setInterval(() => setToday(format(new Date(), 'yyyy-MM-dd')), 30000);
    return () => clearInterval(timer);
  }, []);
  const [filters, setFilters] = useQueryStates({
    person: parseAsString.withDefault('ALL'),
    fundPage: parseAsInteger.withDefault(1),
  });
  const person = filters.person === 'TSO' || filters.person === 'Nway' ? filters.person : 'ALL';
  const query = useFundMonth(null, person);
  const [exporting, setExporting] = useState(false);
  const deletion = useDeleteFundTransaction();
  const [action, setAction] = useState<{
    transaction?: FundTransaction;
    kind: 'save' | 'spend';
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FundTransaction | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const lastPage = Math.max(1, Math.ceil((query.data?.length ?? 0) / PAGE_SIZE));
  const page = Math.max(1, Math.min(filters.fundPage, lastPage));
  useEffect(() => {
    if (query.data && filters.fundPage !== page) void setFilters({ fundPage: page });
  }, [query.data, filters.fundPage, page, setFilters]);
  async function remove() {
    if (!deleteTarget || deletion.isPending) return;
    try {
      await scope.assertCurrent();
      await deletion.mutateAsync({ userId: userId!, id: deleteTarget.id });
      if (!scope.isCurrent()) return;
      setDeleteTarget(null);
      toast.success('Fund transaction deleted');
    } catch (error) {
      if (scope.isCurrent())
        setDeleteError(
          error instanceof DataRequestError
            ? error.message
            : 'Could not delete the transaction. Refresh and try again.',
        );
    }
  }
  return (
    <Flex direction="column" gap="5" className={cn('flex flex-col gap-5', styles.theme)}>
      <FundSummaryCard
        query={query}
        disabled={!userId}
        person={person}
        onPersonChange={(person) => void setFilters({ person, fundPage: 1 })}
        onRecord={() => setAction({ kind: 'save' })}
      />
      <Card className="gap-4 rounded-4xl border border-border py-5 shadow-sm ring-0">
        <CardHeader className="px-5">
          <Flex
            align="center"
            justify="between"
            gap="2"
            wrap="wrap"
            className="flex items-center justify-between gap-2 flex-wrap border-b border-border pb-2"
          >
            <Flex className="flex items-center gap-2" align="center" gap="2">
              <Flex
                align="center"
                justify="center"
                className="flex items-center justify-center size-8 rounded-full bg-secondary text-secondary-foreground"
              >
                <Users className="size-4" />
              </Flex>
              <h3 className="text-xs font-black uppercase tracking-wide">Fund Activity</h3>
            </Flex>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full px-3"
              disabled={!query.data?.length}
              onClick={() => setExporting(true)}
            >
              <Download data-icon="inline-start" /> Export Statement
            </Button>
          </Flex>
        </CardHeader>
        <CardContent className="px-5">
          <Flex className="flex flex-col gap-4" direction="column" gap="4">
            {query.isPending && <Skeleton className="h-48 rounded-2xl" />}
            {query.data && (
              <Flex className="flex flex-col gap-3" direction="column" gap="3">
                {query.data.length === 0 && (
                  <p className="py-8 text-center text-xs leading-relaxed text-muted-foreground">
                    No fund records found. Use Record Money to add savings or spending.
                  </p>
                )}
                {query.data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((transaction) => (
                  <FundTransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={() => setAction({ transaction, kind: transaction.kind })}
                    onDelete={() => {
                      setDeleteError(null);
                      setDeleteTarget(transaction);
                    }}
                  />
                ))}
                {lastPage > 1 && (
                  <Flex
                    className="flex items-center justify-between gap-2"
                    align="center"
                    justify="between"
                    gap="2"
                  >
                    <Button
                      variant="outline"
                      className="rounded-full"
                      size="lg"
                      disabled={page <= 1}
                      onClick={() => void setFilters({ fundPage: page - 1 })}
                    >
                      Previous
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {page} / {lastPage}
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      size="lg"
                      disabled={page >= lastPage}
                      onClick={() => void setFilters({ fundPage: page + 1 })}
                    >
                      Next
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        </CardContent>
      </Card>
      {action && (
        <FundTransactionDialog
          key={`${userId}:${action.transaction?.id ?? 'new'}`}
          transaction={action.transaction}
          kind={action.kind}
          date={today}
          onClose={() => setAction(null)}
        />
      )}
      {exporting && (
        <ExportTableModal
          isOpen
          onClose={() => setExporting(false)}
          title="Relationship Fund Statement"
          subtitle={`${person === 'ALL' ? 'TSO & Nway' : person} · Savings & spending (MMK)`}
          rows={(query.data ?? []).map((transaction) => ({
            date: transaction.date,
            from: `${transaction.person ?? 'Unassigned'} · ${transaction.title}`,
            categoryOrType: transaction.kind === 'save' ? 'Saved' : 'Spent',
            amount: transaction.amount,
            currency: 'MMK',
            isPositive: transaction.kind === 'save',
          }))}
        />
      )}
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete fund transaction?"
        desc={`Remove “${deleteTarget?.title ?? ''}” and reverse its effect on the relationship fund. Available stays unchanged.`}
        isLoading={deletion.isPending}
        error={deleteError}
        onPress={() => void remove()}
      />
    </Flex>
  );
}
