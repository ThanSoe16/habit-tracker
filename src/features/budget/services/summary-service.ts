import { accountService } from '@/lib/supabase/account-client';
import { readCompleteList } from '@/lib/supabase/request';

/** Complete numeric projections keep summary cards independent of list pages. */
export const budgetSummaryService = {
  async activeSalaries(signal: AbortSignal) {
    const { supabase } = await accountService.getClient();
    const result = await supabase
      .from('monthly_salary')
      .select('id', { count: 'exact', head: true })
      .eq('is_enabled', true)
      .abortSignal(signal);
    if (result.error || result.count === null) throw new Error('Could not load the salary count.');
    return result.count;
  },
  async gold(signal: AbortSignal) {
    const { supabase } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase
        .from('gold_holdings')
        .select('id,kyat,pae,yway,buy_price,currency,status,sell_price', { count: 'exact' })
        .order('id')
        .abortSignal(signal),
    );
    return data.map((row) => ({
      id: String(row.id),
      kyat: Number(row.kyat),
      pae: Number(row.pae),
      yway: Number(row.yway),
      buyPrice: Number(row.buy_price),
      currency: String(row.currency),
      status: String(row.status),
      sellPrice: Number(row.sell_price ?? 0),
    }));
  },
  async family(signal: AbortSignal) {
    const { supabase } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase
        .from('family_budgets')
        .select('id,person,type,amount,date', { count: 'exact' })
        .order('id')
        .abortSignal(signal),
    );
    return data.map((row) => ({
      id: String(row.id),
      person: String(row.person),
      type: String(row.type),
      amount: Number(row.amount),
      date: String(row.date),
    }));
  },
};
