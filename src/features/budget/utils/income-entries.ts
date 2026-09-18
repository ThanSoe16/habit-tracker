import type { BudgetEntry, CurrencyCode } from '../store/model';

/** Personal income excludes the separate family ledger and legacy savings transfers. */
export function getIncomeEntries(entries: BudgetEntry[], currency: CurrencyCode | 'ALL' = 'ALL') {
  return entries
    .filter(
      (entry) =>
        entry.type === 'income' &&
        entry.category !== 'Family' &&
        !entry.id.startsWith('savings-') &&
        (currency === 'ALL' || entry.currency === currency),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
