import { reportSettingsSync } from '@/features/settings/sync-status';
import { budgetService } from '@/features/budget/services/supabase';
import type {
  BudgetEntry,
  CurrencyCode,
  FamilyTransaction,
  GoldHolding,
  LoanTransaction,
  MonthlySalary,
  WalletBalances,
} from './model';

export type BudgetSnapshot = {
  walletBalances: WalletBalances;
  monthlySalaries: MonthlySalary[];
  budgetEntries: BudgetEntry[];
  familyTransactions: FamilyTransaction[];
  loans: LoanTransaction[];
  goldHoldings: GoldHolding[];
  currency: CurrencyCode;
  lastProcessedMonth: string;
};

function recordsChanged<T extends { id: string }>(current: T[], previous: T[]): T[] {
  const previousById = new Map(previous.map((record) => [record.id, record]));
  return current.filter((record) => {
    const oldRecord = previousById.get(record.id);
    return (
      !oldRecord || (oldRecord !== record && JSON.stringify(oldRecord) !== JSON.stringify(record))
    );
  });
}

function recordsRemoved<T extends { id: string }>(current: T[], previous: T[]): T[] {
  const currentIds = new Set(current.map((record) => record.id));
  return previous.filter((record) => !currentIds.has(record.id));
}

export async function syncBudgetDelta(
  current: BudgetSnapshot,
  previous: BudgetSnapshot,
): Promise<void> {
  const writes: Promise<void>[] = [];

  if (current.walletBalances !== previous.walletBalances) {
    const changedBalances = Object.fromEntries(
      Object.entries(current.walletBalances).filter(
        ([currency, balance]) => previous.walletBalances[currency] !== balance,
      ),
    ) as Partial<WalletBalances>;
    writes.push(budgetService.upsertWalletBalances(changedBalances));
  }

  if (current.monthlySalaries !== previous.monthlySalaries) {
    writes.push(
      budgetService.upsertMonthlySalaries(
        recordsChanged(current.monthlySalaries, previous.monthlySalaries),
      ),
    );
    for (const salary of recordsRemoved(current.monthlySalaries, previous.monthlySalaries)) {
      writes.push(budgetService.deleteMonthlySalary(salary.id));
    }
  }

  if (current.budgetEntries !== previous.budgetEntries) {
    writes.push(
      budgetService.upsertBudgetEntries(
        recordsChanged(current.budgetEntries, previous.budgetEntries),
      ),
    );
    for (const entry of previous.budgetEntries.filter(
      (old) => !current.budgetEntries.some((next) => next.id === old.id && next.type === old.type),
    )) {
      writes.push(budgetService.deleteBudgetEntry(entry.id, entry.type));
    }
  }

  if (current.familyTransactions !== previous.familyTransactions) {
    writes.push(
      budgetService.upsertFamilyTransactions(
        recordsChanged(current.familyTransactions, previous.familyTransactions),
      ),
    );
    for (const transaction of recordsRemoved(
      current.familyTransactions,
      previous.familyTransactions,
    )) {
      writes.push(budgetService.deleteFamilyTransaction(transaction.id));
    }
  }

  if (current.loans !== previous.loans) {
    writes.push(budgetService.upsertLoans(recordsChanged(current.loans, previous.loans)));
    for (const loan of recordsRemoved(current.loans, previous.loans)) {
      writes.push(budgetService.deleteLoan(loan.id));
    }
  }

  if (current.goldHoldings !== previous.goldHoldings) {
    writes.push(
      budgetService.upsertGoldHoldings(recordsChanged(current.goldHoldings, previous.goldHoldings)),
    );
    for (const holding of recordsRemoved(current.goldHoldings, previous.goldHoldings)) {
      writes.push(budgetService.deleteGoldHolding(holding.id));
    }
  }

  if (
    current.currency !== previous.currency ||
    current.lastProcessedMonth !== previous.lastProcessedMonth
  ) {
    writes.push(budgetService.upsertSettings(current.currency, current.lastProcessedMonth));
  }

  const results = await Promise.allSettled(writes);
  const failure = results.find((result) => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
}

export function createBudgetSyncScheduler(
  delayMs = 250,
  synchronize: typeof syncBudgetDelta = syncBudgetDelta,
) {
  type Delta = { current: BudgetSnapshot; previous: BudgetSnapshot };
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Delta | undefined;
  const queue: Delta[] = [];
  let running = false;
  let failed = false;
  let revision = 0;
  const flush = async () => {
    if (running) return;
    running = true;
    failed = false;
    reportSettingsSync('budget', 'saving', retry);
    while (queue.length) {
      try {
        await synchronize(queue[0].current, queue[0].previous);
        queue.shift();
      } catch (error) {
        running = false;
        failed = true;
        reportSettingsSync(
          'budget',
          'error',
          retry,
          error instanceof Error ? error.message : 'Unable to sync budget changes.',
        );
        return;
      }
    }
    running = false;
    if (!pending) reportSettingsSync('budget', 'saved', retry);
  };
  function retry() {
    void flush();
  }
  return {
    get hasPending() {
      return running || !!pending || queue.length > 0;
    },
    get revision() {
      return revision;
    },
    schedule(current: BudgetSnapshot, previous: BudgetSnapshot) {
      if (
        Object.keys(current).every(
          (key) => current[key as keyof BudgetSnapshot] === previous[key as keyof BudgetSnapshot],
        )
      )
        return;
      revision++;
      pending = pending ? { current, previous: pending.previous } : { current, previous };
      if (!failed) reportSettingsSync('budget', 'saving', retry);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (pending) queue.push(pending);
        pending = undefined;
        timer = undefined;
        if (!failed) void flush();
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = undefined;
      pending = undefined;
    },
  };
}
