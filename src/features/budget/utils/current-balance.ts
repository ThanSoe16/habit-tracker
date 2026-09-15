import type { CurrencyCode } from '../store/model';

/** Home's displayed total; relationship funds are denominated in MMK. */
export function getCurrentBalance(
  available: number,
  savings: number | null,
  relationshipFunds: number | null,
  currency: CurrencyCode,
): number | null {
  if (savings === null || (currency === 'MMK' && relationshipFunds === null)) return null;
  return available + savings + (currency === 'MMK' ? relationshipFunds! : 0);
}
