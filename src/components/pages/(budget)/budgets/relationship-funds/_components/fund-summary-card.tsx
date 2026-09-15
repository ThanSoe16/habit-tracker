'use client';
import { Flex, Grid } from '@radix-ui/themes';
import { Plus, Users } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/features/budget/store/model';
import { getFundSummary, type FundTransaction } from '@/features/relationship-funds/types';
import { cn } from '@/utils/cn';
import styles from '../relationship-funds.module.css';

export function FundSummaryCard({
  query,
  disabled,
  person,
  onPersonChange,
  onRecord,
}: {
  query: UseQueryResult<FundTransaction[]>;
  disabled: boolean;
  person: 'ALL' | 'TSO' | 'Nway';
  onPersonChange: (person: 'ALL' | 'TSO' | 'Nway') => void;
  onRecord: () => void;
}) {
  const summary = query.data ? getFundSummary(query.data) : null;
  return (
    <Card className="gap-4 rounded-4xl border border-border py-6 shadow-xl ring-0">
      <CardHeader className="px-6">
        <Flex
          className="flex items-center justify-between gap-3 flex-wrap"
          align="center"
          justify="between"
          gap="3"
          wrap="wrap"
        >
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground">
            Relationship Funds (MMK)
          </h2>
          <Button
            size="sm"
            className="rounded-full px-3.5 shadow-md"
            disabled={disabled}
            onClick={onRecord}
          >
            <Plus data-icon="inline-start" /> Record Money
          </Button>
        </Flex>
      </CardHeader>
      <CardContent className="px-6">
        <Flex justify="center" className="flex justify-center pb-5 pt-1">
          <Select
            value={person}
            onValueChange={(value) => onPersonChange(value as 'ALL' | 'TSO' | 'Nway')}
          >
            <SelectTrigger
              aria-label="Filter by person"
              className="h-11 w-auto rounded-full border-0 bg-input px-5 shadow-sm"
            >
              <Users />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={cn(styles.theme, 'rounded-2xl')}>
              <SelectGroup>
                <SelectItem value="ALL">TSO & Nway</SelectItem>
                <SelectItem value="TSO">TSO</SelectItem>
                <SelectItem value="Nway">Nway</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Flex>
        {query.isPending && <Skeleton className="h-16 rounded-2xl" />}
        {query.isError && (
          <Flex className="flex flex-col gap-2" direction="column" gap="2">
            <p role="alert" className="text-xs text-destructive">
              Could not refresh the fund.{summary ? ' Showing the last loaded totals.' : ''}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          </Flex>
        )}
        {summary && (
          <Grid columns="3" gap="2" className="grid gap-2 grid-cols-3 border-t border-border pt-2">
            {[
              { label: 'Total saved', amount: summary.saved, sign: '+', positive: true },
              { label: 'Total spent', amount: summary.spent, sign: '−', positive: false },
              {
                label: 'Net total',
                amount: Math.abs(summary.remaining),
                sign: summary.remaining > 0 ? '+' : summary.remaining < 0 ? '−' : '',
                positive: summary.remaining >= 0,
              },
            ].map((tile) => (
              <Flex
                key={tile.label}
                direction="column"
                gap="1"
                align="center"
                className="flex flex-col items-center gap-1 min-w-0 rounded-3xl border border-border bg-muted px-2 py-3 text-center"
              >
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                  {tile.label}
                </p>
                <p
                  className={cn(
                    'max-w-full break-words text-xs font-black tabular-nums sm:text-sm',
                    tile.positive ? styles.positive : styles.negative,
                  )}
                >
                  {tile.sign}
                  {formatCurrency(tile.amount, 'MMK')}
                </p>
              </Flex>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
