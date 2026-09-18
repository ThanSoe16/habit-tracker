'use client';
import { Flex } from '@radix-ui/themes';
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/features/budget/store/model';
import type { FundTransaction } from '@/features/relationship-funds/types';
import { cn } from '@/utils/cn';
import styles from '../relationship-funds.module.css';

export function FundTransactionRow({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: FundTransaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const saving = transaction.kind === 'save';
  const Icon = saving ? ArrowDownLeft : ArrowUpRight;
  return (
    <Flex
      direction="column"
      gap="3"
      className="flex flex-col gap-3 rounded-3xl border border-border bg-muted p-3.5"
    >
      <Flex
        className="flex items-center justify-between gap-3"
        align="center"
        justify="between"
        gap="3"
      >
        <Flex align="center" gap="2" className="flex items-center gap-2 min-w-0">
          <Flex
            align="center"
            justify="center"
            className={cn(
              'flex items-center justify-center',
              cn('size-9 shrink-0 rounded-full', saving ? styles.saveIcon : styles.spendIcon),
            )}
          >
            <Icon className="size-4" />
          </Flex>
          <Flex
            align="center"
            gap="1"
            wrap="wrap"
            className="flex items-center gap-1 flex-wrap min-w-0"
          >
            <h4 className="break-words text-xs font-extrabold">
              {saving ? 'Saved by' : 'Spent by'} {transaction.person ?? 'Unassigned'}
            </h4>
            <Badge
              className={cn(
                'h-5 rounded-md px-1.5 text-xs font-black uppercase',
                saving ? styles.savedBadge : styles.spentBadge,
              )}
            >
              {saving ? 'Saved' : 'Spent'}
            </Badge>
          </Flex>
        </Flex>
        <p
          className={cn(
            'max-w-36 shrink-0 break-words text-right text-sm font-black tabular-nums',
            saving ? styles.positive : styles.negative,
          )}
        >
          {saving ? '+' : '−'}
          {formatCurrency(transaction.amount, 'MMK')}
        </p>
      </Flex>
      <Flex
        align="center"
        justify="between"
        gap="2"
        className="flex items-center justify-between gap-2 border-t border-border pt-1.5"
      >
        <Flex direction="column" gap="1" className="flex flex-col gap-1 min-w-0">
          <p className="break-words text-xs font-semibold text-muted-foreground">
            {transaction.date} · {transaction.title}
            {transaction.note ? ` · ${transaction.note}` : ''}
          </p>
        </Flex>
        <Flex gap="1" className="flex gap-1 shrink-0 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${transaction.title}`}
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${transaction.title}`}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
