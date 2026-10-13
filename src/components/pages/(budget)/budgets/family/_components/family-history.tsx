import { Users, Download, ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, type FamilyTransaction } from '@/store/use-budget-store';
import { cn } from '@/utils/cn';

type FamilyHistoryProps = {
  filteredTxs: FamilyTransaction[];
  onExport: () => void;
  handleOpenEditDrawer: (transaction: FamilyTransaction) => void;
  setDeleteTxId: (id: string) => void;
};

export function FamilyHistory({
  filteredTxs,
  onExport,
  handleOpenEditDrawer,
  setDeleteTxId,
}: FamilyHistoryProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Users className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Family Transfer Activity
          </h2>
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={filteredTxs.length === 0}
          className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-black flex items-center gap-1.5 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Export Statement
        </button>
      </div>

      {filteredTxs.length > 0 ? (
        <div className="space-y-2.5">
          {filteredTxs.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl space-y-2 border border-gray-100 dark:border-zinc-700/60"
            >
              {/* Top Row: Icon + Title + Pill (Left) & Amount (Right) */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-sm',
                      tx.type === 'received' ? 'bg-emerald-500' : 'bg-rose-500',
                    )}
                  >
                    {tx.type === 'received' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {tx.type === 'received'
                          ? `Received from ${tx.person}`
                          : `Given back to ${tx.person}`}
                      </p>
                      <span
                        className={cn(
                          'text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0',
                          tx.type === 'received'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
                        )}
                      >
                        {tx.type === 'received' ? 'Received' : 'Given'}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={cn(
                    'font-black text-sm tabular-nums shrink-0',
                    tx.type === 'received'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400',
                  )}
                >
                  {tx.type === 'received' ? '+' : '-'}
                  {formatCurrency(tx.amount, tx.currency)}
                </span>
              </div>

              {/* Bottom Row: Date + Note (Left) & Edit/Delete Actions (Right) */}
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/50 dark:border-zinc-700/40 text-[10px] font-bold text-gray-400">
                <span className="truncate">
                  {tx.date} {tx.note ? `• ${tx.note}` : ''}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditDrawer(tx)}
                    className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Edit Record"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTxId(tx.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 font-bold text-center py-6">
          No family records found for the selected filters.
        </p>
      )}
    </div>
  );
}
