import { supabase } from '@/lib/supabase/client';
import type {
  BudgetEntry,
  FamilyTransaction,
  GoldHolding,
  LoanTransaction,
  MonthlySalary,
  WalletBalances,
} from '../store/model';

type SupabaseMutationResult = {
  error: { message: string } | null;
};

async function runMutation(
  mutation: PromiseLike<SupabaseMutationResult>,
  context: string,
): Promise<void> {
  const { error } = await mutation;
  if (error) throw new Error(`${context}: ${error.message}`);
}

function toFamilyPayload(transaction: FamilyTransaction) {
  return {
    id: transaction.id,
    type: transaction.type,
    person: transaction.person,
    amount: transaction.amount,
    currency: transaction.currency,
    date: transaction.date,
    note: transaction.note || null,
    add_to_current_budget: transaction.addToCurrentBudget ?? true,
    entry_id: transaction.entryId || null,
  };
}

function toIncomePayload(entry: BudgetEntry) {
  return {
    id: entry.id,
    title: entry.title,
    amount: entry.amount,
    currency: entry.currency,
    category: entry.category,
    date: entry.date,
    note: entry.note || null,
  };
}

function toExchangePayload(entry: BudgetEntry) {
  return {
    id: entry.id,
    title: entry.title,
    from_currency: entry.fromCurrency || entry.currency,
    from_amount: entry.fromAmount || entry.amount,
    to_currency: entry.toCurrency,
    to_amount: entry.toAmount,
    rate: entry.fromAmount && entry.toAmount ? entry.toAmount / entry.fromAmount : null,
    date: entry.date,
  };
}

function toSalaryPayload(salary: MonthlySalary) {
  return {
    id: salary.id,
    title: salary.title,
    amount: salary.amount,
    currency: salary.currency,
    category: salary.category,
    is_enabled: salary.isEnabled ?? true,
    disabled_reason: salary.disabledReason || null,
    note: salary.note || null,
  };
}

function toLoanPayload(loan: LoanTransaction) {
  return {
    id: loan.id,
    type: loan.type,
    person_name: loan.personName,
    amount: loan.amount,
    currency: loan.currency,
    status: loan.status || 'pending',
    repaid_amount: loan.repaidAmount || 0,
    due_date: loan.dueDate || null,
    date: loan.date,
    note: loan.note || null,
  };
}

function toGoldPayload(holding: GoldHolding) {
  return {
    id: holding.id,
    kyat: holding.kyat,
    pae: holding.pae,
    yway: holding.yway,
    buy_price: holding.buyPrice,
    currency: holding.currency,
    purchase_date: holding.purchaseDate,
    note: holding.note || null,
    status: holding.status,
    sell_price: holding.sellPrice ?? null,
    sold_date: holding.soldDate || null,
  };
}

export const budgetWriteService = {
  async upsertWalletBalances(balances: Partial<WalletBalances>): Promise<void> {
    const payloads = Object.entries(balances).map(([currency, balance]) => ({
      currency,
      balance,
      updated_at: new Date().toISOString(),
    }));
    if (payloads.length === 0) return;
    await runMutation(
      supabase.from('current_budget').upsert(payloads, { onConflict: 'currency' }),
      'Unable to update wallet balances',
    );
  },

  async upsertFamilyTransactions(transactions: FamilyTransaction[]): Promise<void> {
    if (transactions.length === 0) return;
    await runMutation(
      supabase
        .from('family_budgets')
        .upsert(transactions.map(toFamilyPayload), { onConflict: 'id' }),
      'Unable to update family transactions',
    );
  },

  async upsertBudgetEntries(entries: BudgetEntry[]): Promise<void> {
    const incomes = entries.filter((entry) => entry.type === 'income').map(toIncomePayload);
    const expenses = entries.filter((entry) => entry.type === 'expense').map(toIncomePayload);
    const exchanges = entries.filter((entry) => entry.type === 'exchange').map(toExchangePayload);

    const results = await Promise.allSettled([
      incomes.length > 0
        ? runMutation(
            supabase.from('incomes').upsert(incomes, { onConflict: 'id' }),
            'Unable to update incomes',
          )
        : Promise.resolve(),
      expenses.length > 0
        ? runMutation(
            supabase.from('expenses').upsert(expenses, { onConflict: 'id' }),
            'Unable to update expenses',
          )
        : Promise.resolve(),
      exchanges.length > 0
        ? runMutation(
            supabase.from('currency_exchanges').upsert(exchanges, { onConflict: 'id' }),
            'Unable to update currency exchanges',
          )
        : Promise.resolve(),
    ]);
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
  },

  async upsertMonthlySalaries(salaries: MonthlySalary[]): Promise<void> {
    if (salaries.length === 0) return;
    await runMutation(
      supabase.from('monthly_salary').upsert(salaries.map(toSalaryPayload), { onConflict: 'id' }),
      'Unable to update monthly salaries',
    );
  },

  async upsertLoans(loans: LoanTransaction[]): Promise<void> {
    if (loans.length === 0) return;
    await runMutation(
      supabase.from('loans').upsert(loans.map(toLoanPayload), { onConflict: 'id' }),
      'Unable to update loans',
    );
  },

  async upsertGoldHoldings(holdings: GoldHolding[]): Promise<void> {
    if (holdings.length === 0) return;
    await runMutation(
      supabase.from('gold_holdings').upsert(holdings.map(toGoldPayload), { onConflict: 'id' }),
      'Unable to update gold holdings',
    );
  },

  async upsertSettings(
    currency: string | undefined,
    lastProcessedMonth: string | undefined,
  ): Promise<void> {
    await runMutation(
      supabase.from('budget_settings').upsert(
        {
          id: 'default_settings',
          default_currency: currency || 'USDT',
          last_processed_month: lastProcessedMonth || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      ),
      'Unable to update budget settings',
    );
  },
};
