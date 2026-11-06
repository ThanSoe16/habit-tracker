'use client';
import { QueryFeedback } from '@/components/shared/infinite-list/query-feedback';
import { useBudgetList, useGoldSummary } from '@/features/budget/services/list-queries';
import { InfiniteListEnd } from '@/components/shared/infinite-list';

import React, { useMemo, useState } from 'react';
import { Gem, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, GoldHolding, useBudgetStore } from '@/store/use-budget-store';
import { GoldRecordCard } from './_components/gold-record-card';
import { GoldRecordDrawer } from './_components/gold-record-drawer';
import { formatGoldWeight } from '@/features/budget/utils/gold-weight';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { cn } from '@/utils/cn';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { MoneyInput } from '@/components/ui/money-input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type HoldingFilter = 'all' | 'holding' | 'sold';

const today = () => new Date().toISOString().split('T')[0];

export default function GoldPage() {
  const userId = useQueryIdentity();
  return <GoldPageContent key={userId} />;
}

function GoldPageContent() {
  const goldHoldings = useBudgetStore((state) => state.goldHoldings);
  const sellGold = useBudgetStore((state) => state.sellGold);
  const deleteGoldHolding = useBudgetStore((state) => state.deleteGoldHolding);
  const [filter, setFilter] = useState<HoldingFilter>('all');
  const [buyDrawerOpen, setBuyDrawerOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<GoldHolding | null>(null);
  const [sellingHolding, setSellingHolding] = useState<GoldHolding | null>(null);
  const [deletingHolding, setDeletingHolding] = useState<GoldHolding | null>(null);

  const [sellPrice, setSellPrice] = useState('');
  const [soldDate, setSoldDate] = useState(today());

  const query = useBudgetList('gold', { status: filter });
  const summary = useGoldSummary();
  const filteredHoldings = useMemo(
    () =>
      goldHoldings
        .filter(
          (holding) => query.ids.has(holding.id) && (filter === 'all' || holding.status === filter),
        )
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()),
    [filter, goldHoldings, query.ids],
  );

  const activeHoldings = (summary.data ?? []).filter((holding) => holding.status === 'holding');
  const activeYway = activeHoldings.reduce(
    (sum, holding) => sum + holding.kyat * 128 + holding.pae * 8 + holding.yway,
    0,
  );
  const realizedProfit = (summary.data ?? [])
    .filter((holding) => holding.status === 'sold' && holding.currency === 'MMK')
    .reduce((sum, holding) => sum + (holding.sellPrice || 0) - holding.buyPrice, 0);

  const handleSell = (event: React.FormEvent) => {
    event.preventDefault();
    if (!sellingHolding) return;
    const price = Number(sellPrice.replace(/,/g, ''));
    if (!price || price <= 0) {
      toast.error('Enter the total selling price.');
      return;
    }
    sellGold(sellingHolding.id, price, soldDate);
    toast.success('Gold sale saved and added to your wallet.');
    setSellingHolding(null);
    setSellPrice('');
    setSoldDate(today());
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[32px] border border-amber-200/70 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-6 text-white shadow-xl shadow-amber-500/20 dark:border-amber-700/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-amber-950/70">
              <Gem className="h-4 w-4" /> GOLD HOLDINGS
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              {(activeYway / 128).toLocaleString('en-US', { maximumFractionDigits: 3 })}
              <span className="ml-2 text-base font-extrabold text-amber-950/70">ကျပ်သား</span>
            </h2>
            <p className="mt-1 text-xs font-bold text-amber-950/70">
              {activeHoldings.length} active{' '}
              {activeHoldings.length === 1 ? 'purchase' : 'purchases'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBuyDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-amber-700 shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Buy Gold
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase text-amber-950/60">Active cost</p>
            <p className="mt-1 text-sm font-black">
              {formatCurrency(
                activeHoldings
                  .filter((holding) => holding.currency === 'MMK')
                  .reduce((sum, holding) => sum + holding.buyPrice, 0),
                'MMK',
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase text-amber-950/60">Realized P/L (MMK)</p>
            <p className={cn('mt-1 text-sm font-black', realizedProfit < 0 && 'text-red-900')}>
              {realizedProfit > 0 ? '+' : ''}
              {formatCurrency(realizedProfit, 'MMK')}
            </p>
          </div>
        </div>
      </section>

      <div className="flex rounded-full border border-gray-100 bg-white p-1.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {(['all', 'holding', 'sold'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'flex-1 rounded-full py-2 text-xs font-black capitalize transition-all',
              filter === value
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white',
            )}
          >
            {value === 'holding' ? 'Holding' : value}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {filteredHoldings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 px-6 py-10 text-center dark:border-amber-900 dark:bg-amber-950/20">
            <Gem className="mx-auto mb-3 h-9 w-9 text-amber-400" />
            <p className="text-sm font-black text-gray-800 dark:text-white">No gold records yet</p>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              Add your first purchase to start tracking it.
            </p>
          </div>
        ) : (
          filteredHoldings.map((holding) => (
            <GoldRecordCard
              key={holding.id}
              holding={holding}
              onEdit={setEditingHolding}
              onSell={(record) => {
                setSellingHolding(record);
                setSellPrice('');
                setSoldDate(today());
              }}
              onDelete={setDeletingHolding}
            />
          ))
        )}
      </section>

      {(buyDrawerOpen || editingHolding) && (
        <GoldRecordDrawer
          key={editingHolding?.id ?? 'new'}
          holding={editingHolding ?? undefined}
          onClose={() => {
            setBuyDrawerOpen(false);
            setEditingHolding(null);
          }}
        />
      )}

      <Drawer open={!!sellingHolding} onOpenChange={(open) => !open && setSellingHolding(null)}>
        <DrawerContent className="z-[80] mx-auto max-w-lg rounded-t-[36px] bg-white p-6 text-gray-900 dark:bg-zinc-900 dark:text-white">
          <DrawerTitle className="mb-1 flex items-center gap-2 text-base font-black">
            <TrendingUp className="h-5 w-5 text-emerald-600" /> Sell Gold
          </DrawerTitle>
          <p className="mb-5 text-xs font-semibold text-gray-400">
            {sellingHolding && formatGoldWeight(sellingHolding)} · Cost{' '}
            {sellingHolding && formatCurrency(sellingHolding.buyPrice, sellingHolding.currency)}
          </p>
          <form onSubmit={handleSell} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Total selling price
              </label>
              <MoneyInput
                value={sellPrice}
                setValue={setSellPrice}
                postfix={sellingHolding?.currency || 'MMK'}
                placeholder="Enter total sale price"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Sold date
              </label>
              <DatePicker value={soldDate} onChange={setSoldDate} />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white"
            >
              Confirm Sale
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        open={!!deletingHolding}
        onOpenChange={(open) => !open && setDeletingHolding(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gold record?</AlertDialogTitle>
            <AlertDialogDescription>
              The purchase and any sale will be reversed in your wallet balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingHolding) deleteGoldHolding(deletingHolding.id);
                setDeletingHolding(null);
                toast.success('Gold record deleted.');
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <InfiniteListEnd query={query} />
      <QueryFeedback query={summary} label="gold totals" />
    </div>
  );
}
