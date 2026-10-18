import { z } from 'zod';
import { endOfMonth, format, parseISO } from 'date-fns';
import { listPage, pageRange } from '@/lib/supabase/pagination';
import { readCompleteList } from '@/lib/supabase/request';
import { accountService } from '@/lib/supabase/account-client';
import type { WalletBalances } from '@/features/budget/store/model';
import type { BudgetData } from '../types/budget-sync';

export type BudgetReadGroup =
  | 'wallets'
  | 'family'
  | 'income'
  | 'expenses'
  | 'exchange'
  | 'salary'
  | 'settings'
  | 'loans'
  | 'gold';
export const budgetReadService = {
  async familyEntries(transactions: NonNullable<BudgetData['familyTransactions']>) {
    const { supabase } = await accountService.getClient();
    const entries: NonNullable<BudgetData['budgetEntries']> = [];
    for (const type of ['income', 'expense'] as const) {
      const ids = transactions
        .filter((tx) => tx.entryId && (tx.type === 'received' ? 'income' : 'expense') === type)
        .map((tx) => tx.entryId!);
      if (!ids.length) continue;
      const { data, error } = await supabase
        .from(type === 'income' ? 'incomes' : 'expenses')
        .select('id,title,amount,currency,category,date,note')
        .in('id', ids)
        .range(0, 9);
      if (error || !data) throw new Error('Could not load linked family entries.');
      entries.push(
        ...data.map((row) => ({
          id: row.id,
          title: row.title,
          amount: Number(row.amount),
          currency: row.currency,
          type,
          category: row.category,
          date: row.date,
          note: row.note ?? undefined,
        })),
      );
    }
    return entries;
  },

  async fetchBudgetData(
    groups?: BudgetReadGroup[],
    page?: number,
    filters: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<BudgetData | null> {
    const { supabase } = await accountService.getClient();
    const has = (group: BudgetReadGroup) => !groups || groups.includes(group);
    let pageTotal = 0;
    const match = (group: BudgetReadGroup): Record<string, string> => {
      const values: Record<string, string> = {};
      if (filters.currency && filters.currency !== 'ALL' && group !== 'exchange')
        values.currency = z.enum(['USDT', 'THB', 'MMK', 'SGD']).parse(filters.currency);
      if (group === 'family' && filters.familyPerson && filters.familyPerson !== 'ALL')
        values.person = filters.familyPerson;
      if (group === 'loans' && filters.type && filters.type !== 'ALL') values.type = filters.type;
      if (group === 'loans' && filters.status === 'repaid') values.status = 'repaid';
      if (group === 'gold' && filters.status && filters.status !== 'all')
        values.status = filters.status;
      return values;
    };
    const month = filters.familyMonth
      ? z
          .string()
          .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
          .parse(filters.familyMonth)
      : null;
    const currency =
      filters.currency && filters.currency !== 'ALL'
        ? z.enum(['USDT', 'THB', 'MMK', 'SGD']).parse(filters.currency)
        : null;
    const read = async <T>(
      group: BudgetReadGroup,
      query: Parameters<typeof readCompleteList<T>>[0],
    ) => {
      if (!has(group)) return { data: [] as T[], error: null };
      if (page !== undefined) {
        const result = listPage(await query.range(...pageRange(page)), page);
        pageTotal = result.total;
        return { data: result.rows, error: null };
      }
      return readCompleteList(query);
    };
    try {
      const [
        walletsRes,
        familyRes,
        incomesRes,
        expensesRes,
        exchangesRes,
        salaryRes,
        settingsRes,
        loansRes,
        goldRes,
      ] = await Promise.all([
        read(
          'wallets',
          supabase
            .from('current_budget')
            .select('currency, balance', { count: 'exact' })
            .order('currency'),
        ),
        read(
          'family',
          supabase
            .from('family_budgets')
            .select(
              'id, type, person, amount, currency, date, note, add_to_current_budget, entry_id',
              { count: 'exact' },
            )
            .match(match('family'))
            .gte('date', month ? `${month}-01` : '0001-01-01')
            .lte(
              'date',
              month ? format(endOfMonth(parseISO(`${month}-01`)), 'yyyy-MM-dd') : '9999-12-31',
            )
            .abortSignal(signal ?? new AbortController().signal)
            .order('date', { ascending: false })
            .order('id'),
        ),
        read(
          'income',
          supabase
            .from('incomes')
            .select('id, title, amount, currency, category, date, note', { count: 'exact' })
            .match(match('income'))
            .or(
              filters.excludeFamily === 'true'
                ? 'category.neq.Family,category.is.null'
                : 'id.not.is.null',
            )
            .not('id', 'like', filters.excludeFamily === 'true' ? 'savings-%' : '')
            .abortSignal(signal ?? new AbortController().signal)
            .order('date', { ascending: false })
            .order('id'),
        ),
        read(
          'expenses',
          supabase
            .from('expenses')
            .select('id, title, amount, currency, category, date, note', { count: 'exact' })
            .match(match('expenses'))
            .or(
              filters.excludeFamily === 'true'
                ? 'category.neq.Family,category.is.null'
                : 'id.not.is.null',
            )
            .abortSignal(signal ?? new AbortController().signal)
            .order('date', { ascending: false })
            .order('id'),
        ),
        read(
          'exchange',
          supabase
            .from('currency_exchanges')
            .select('id, title, from_amount, from_currency, to_amount, to_currency, date', {
              count: 'exact',
            })
            .match(match('exchange'))
            .or(
              currency
                ? `from_currency.eq.${currency},to_currency.eq.${currency}`
                : 'id.not.is.null',
            )
            .abortSignal(signal ?? new AbortController().signal)
            .order('date', { ascending: false })
            .order('id'),
        ),
        read(
          'salary',
          supabase
            .from('monthly_salary')
            .select('id, title, amount, currency, category, is_enabled, disabled_reason, note', {
              count: 'exact',
            })
            .order('id'),
        ),
        has('settings')
          ? supabase
              .from('budget_settings')
              .select('last_processed_month, default_currency')
              .eq('id', 'default_settings')
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        read(
          'loans',
          supabase
            .from('loans')
            .select(
              'id, type, person_name, amount, currency, status, repaid_amount, due_date, date, note',
              { count: 'exact' },
            )
            .match(match('loans'))
            .in(
              'status',
              filters.status === 'pending'
                ? ['pending', 'partial']
                : ['pending', 'partial', 'repaid'],
            )
            .abortSignal(signal ?? new AbortController().signal)
            .order('date', { ascending: false })
            .order('id'),
        ),
        read(
          'gold',
          supabase
            .from('gold_holdings')
            .select(
              'id, kyat, pae, yway, buy_price, currency, purchase_date, note, status, sell_price, sold_date',
              { count: 'exact' },
            )
            .match(match('gold'))
            .abortSignal(signal ?? new AbortController().signal)
            .order('purchase_date', { ascending: false })
            .order('id'),
        ),
      ]);

      // A partial snapshot must never replace the last complete local budget.
      const listResults = [
        walletsRes,
        familyRes,
        incomesRes,
        expensesRes,
        exchangesRes,
        salaryRes,
        loansRes,
        goldRes,
      ];
      if (settingsRes.error || listResults.some((result) => result.error || !result.data)) {
        return null;
      }

      const walletBalances: WalletBalances = { USDT: 0, THB: 0, MMK: 0, SGD: 0 };
      walletsRes.data?.forEach((wallet: { currency: string; balance: number }) => {
        walletBalances[wallet.currency] = Number(wallet.balance) || 0;
      });

      const familyTransactions = (familyRes.data || []).map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        person: transaction.person,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        date: transaction.date,
        note: transaction.note || undefined,
        addToCurrentBudget: transaction.add_to_current_budget ?? true,
        entryId: transaction.entry_id || undefined,
      }));

      const incomes = (incomesRes.data || []).map((income) => ({
        id: income.id,
        title: income.title,
        amount: Number(income.amount),
        currency: income.currency,
        type: 'income' as const,
        category: income.category,
        date: income.date,
        note: income.note || undefined,
      }));

      const expenses = (expensesRes.data || []).map((expense) => ({
        id: expense.id,
        title: expense.title,
        amount: Number(expense.amount),
        currency: expense.currency,
        type: 'expense' as const,
        category: expense.category,
        date: expense.date,
        note: expense.note || undefined,
      }));

      const exchanges = (exchangesRes.data || []).map((exchange) => ({
        id: exchange.id,
        title: exchange.title,
        amount: Number(exchange.from_amount),
        currency: exchange.from_currency,
        type: 'exchange' as const,
        category: 'Currency Exchange',
        date: exchange.date,
        fromCurrency: exchange.from_currency,
        fromAmount: Number(exchange.from_amount),
        toCurrency: exchange.to_currency,
        toAmount: Number(exchange.to_amount),
      }));

      const monthlySalaries = (salaryRes.data || []).map((salary) => ({
        id: salary.id,
        title: salary.title,
        amount: Number(salary.amount),
        currency: salary.currency,
        category: salary.category,
        isEnabled: salary.is_enabled ?? true,
        disabledReason: salary.disabled_reason || undefined,
        note: salary.note || undefined,
      }));

      const loans = (loansRes.data || []).map((loan) => ({
        id: loan.id,
        type: loan.type,
        personName: loan.person_name,
        amount: Number(loan.amount),
        currency: loan.currency,
        status: loan.status,
        repaidAmount: Number(loan.repaid_amount || 0),
        dueDate: loan.due_date || undefined,
        date: loan.date,
        note: loan.note || undefined,
      }));

      const goldHoldings = (goldRes.data || []).map((holding) => ({
        id: holding.id,
        kyat: Number(holding.kyat || 0),
        pae: Number(holding.pae || 0),
        yway: Number(holding.yway || 0),
        buyPrice: Number(holding.buy_price),
        currency: holding.currency,
        purchaseDate: holding.purchase_date,
        note: holding.note || undefined,
        status: holding.status,
        sellPrice: holding.sell_price == null ? undefined : Number(holding.sell_price),
        soldDate: holding.sold_date || undefined,
      }));

      const snapshot: BudgetData = {
        pageTotal,
        walletBalances,
        monthlySalaries,
        budgetEntries: [...incomes, ...expenses, ...exchanges],
        familyTransactions,
        loans,
        goldHoldings,
        lastProcessedMonth: settingsRes.data?.last_processed_month || '',
        currency: settingsRes.data?.default_currency || 'USDT',
      };
      if (!has('wallets')) delete snapshot.walletBalances;
      if (!has('family')) delete snapshot.familyTransactions;
      if (!has('salary')) delete snapshot.monthlySalaries;
      if (!has('loans')) delete snapshot.loans;
      if (!has('gold')) delete snapshot.goldHoldings;
      if (!has('settings')) {
        delete snapshot.currency;
        delete snapshot.lastProcessedMonth;
      }
      snapshot.entryTypes = [
        has('income') ? 'income' : null,
        has('expenses') ? 'expense' : null,
        has('exchange') ? 'exchange' : null,
      ].filter((value): value is 'income' | 'expense' | 'exchange' => value !== null);
      if (!snapshot.entryTypes.length) delete snapshot.budgetEntries;
      return snapshot;
    } catch {
      // Legacy sync failure sentinel: preserve the last complete local snapshot.
      return null;
    }
  },
};
