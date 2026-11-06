import type { GoldHolding } from '@/features/budget/store/model';

export function formatGoldWeight(holding: Pick<GoldHolding, 'kyat' | 'pae' | 'yway'>) {
  const parts: string[] = [];
  if (holding.kyat) parts.push(`${holding.kyat} ကျပ်သား`);
  if (holding.pae) parts.push(`${holding.pae} ပဲ`);
  if (holding.yway) parts.push(`${holding.yway} ရွေး`);
  return parts.join(' ') || '0 ရွေး';
}
