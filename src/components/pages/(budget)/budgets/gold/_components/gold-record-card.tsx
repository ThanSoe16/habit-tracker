import { Calendar, Pencil, Scale, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, type GoldHolding } from '@/features/budget/store/model';
import { formatGoldWeight } from '@/features/budget/utils/gold-weight';
import { cn } from '@/utils/cn';

type GoldRecordCardProps = {
  holding: GoldHolding;
  onEdit: (holding: GoldHolding) => void;
  onSell: (holding: GoldHolding) => void;
  onDelete: (holding: GoldHolding) => void;
};

export function GoldRecordCard({ holding, onEdit, onSell, onDelete }: GoldRecordCardProps) {
  const profit = (holding.sellPrice || 0) - holding.buyPrice;
  return (
    <article className="space-y-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Scale className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-gray-900 dark:text-white">
              {formatGoldWeight(holding)}
            </h3>
            <span
              className={cn(
                'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase',
                holding.status === 'holding'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
              )}
            >
              {holding.status}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold text-gray-400">Bought for</p>
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {formatCurrency(holding.buyPrice, holding.currency)}
          </p>
        </div>
      </div>

      {holding.status === 'sold' && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-3 dark:bg-zinc-800/70">
          <div>
            <p className="text-[10px] font-bold text-gray-400">Sold for</p>
            <p className="text-xs font-black text-gray-800 dark:text-white">
              {formatCurrency(holding.sellPrice || 0, holding.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400">Profit / Loss</p>
            <p
              className={cn(
                'flex items-center justify-end gap-1 text-xs font-black',
                profit >= 0 ? 'text-emerald-600' : 'text-red-500',
              )}
            >
              {profit >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {profit > 0 ? '+' : ''}
              {formatCurrency(profit, holding.currency)}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-800">
        <div className="min-w-0 text-[10px] font-bold text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {holding.purchaseDate}
          </span>
          {holding.note && <p className="mt-1 max-w-52 truncate">{holding.note}</p>}
        </div>
        <div className="flex gap-1.5">
          {holding.status === 'holding' && (
            <button
              type="button"
              onClick={() => onSell(holding)}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white"
            >
              Sell
            </button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(holding)}
            aria-label="Edit gold record"
          >
            <Pencil data-icon="inline-start" /> Edit
          </Button>
          <button
            type="button"
            onClick={() => onDelete(holding)}
            className="flex h-7 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 dark:border-zinc-700"
            aria-label="Delete gold record"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
