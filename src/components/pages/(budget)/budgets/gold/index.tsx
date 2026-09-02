'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, Gem, Plus, Scale, TrendingDown, TrendingUp, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  CURRENCIES,
  CurrencyCode,
  formatCurrency,
  GoldHolding,
  useBudgetStore,
} from '@/store/use-budget-store';
import { cn } from '@/utils/cn';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { MoneyInput } from '@/components/ui/money-input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

function formatGoldWeight(holding: Pick<GoldHolding, 'kyat' | 'pae' | 'yway'>) {
  const parts: string[] = [];
  if (holding.kyat) parts.push(`${holding.kyat} ကျပ်သား`);
  if (holding.pae) parts.push(`${holding.pae} ပဲ`);
  if (holding.yway) parts.push(`${holding.yway} ရွေး`);
  return parts.join(' ') || '0 ရွေး';
}

export default function GoldPage() {
  const {
    goldHoldings = [],
    walletBalances,
    buyGold,
    sellGold,
    deleteGoldHolding,
  } = useBudgetStore();
  const [filter, setFilter] = useState<HoldingFilter>('all');
  const [buyDrawerOpen, setBuyDrawerOpen] = useState(false);
  const [sellingHolding, setSellingHolding] = useState<GoldHolding | null>(null);
  const [deletingHolding, setDeletingHolding] = useState<GoldHolding | null>(null);

  const [kyat, setKyat] = useState('1');
  const [pae, setPae] = useState('0');
  const [yway, setYway] = useState('0');
  const [buyPrice, setBuyPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('MMK');
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [note, setNote] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [soldDate, setSoldDate] = useState(today());

  const filteredHoldings = useMemo(
    () =>
      goldHoldings
        .filter((holding) => filter === 'all' || holding.status === filter)
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()),
    [filter, goldHoldings],
  );

  const activeHoldings = goldHoldings.filter((holding) => holding.status === 'holding');
  const activeYway = activeHoldings.reduce(
    (sum, holding) => sum + holding.kyat * 128 + holding.pae * 8 + holding.yway,
    0,
  );
  const realizedProfit = goldHoldings
    .filter((holding) => holding.status === 'sold' && holding.currency === 'MMK')
    .reduce((sum, holding) => sum + (holding.sellPrice || 0) - holding.buyPrice, 0);

  const resetBuyForm = () => {
    setKyat('1');
    setPae('0');
    setYway('0');
    setBuyPrice('');
    setCurrency('MMK');
    setPurchaseDate(today());
    setNote('');
  };

  const handleBuy = (event: React.FormEvent) => {
    event.preventDefault();
    const weight = {
      kyat: Number(kyat) || 0,
      pae: Number(pae) || 0,
      yway: Number(yway) || 0,
    };
    const price = Number(buyPrice.replace(/,/g, ''));

    if (weight.kyat * 128 + weight.pae * 8 + weight.yway <= 0) {
      toast.error('Enter a gold weight greater than zero.');
      return;
    }
    if (!price || price <= 0) {
      toast.error('Enter the total purchase price.');
      return;
    }
    if ((walletBalances[currency] || 0) < price) {
      toast.error(`Not enough ${currency} in your current budget.`);
      return;
    }

    buyGold({
      ...weight,
      buyPrice: price,
      currency,
      purchaseDate,
      note: note.trim() || undefined,
    });
    toast.success('Gold purchase saved.');
    resetBuyForm();
    setBuyDrawerOpen(false);
  };

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
          filteredHoldings.map((holding) => {
            const profit = (holding.sellPrice || 0) - holding.buyPrice;
            return (
              <article
                key={holding.id}
                className="space-y-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
              >
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
                        onClick={() => {
                          setSellingHolding(holding);
                          setSellPrice('');
                          setSoldDate(today());
                        }}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white"
                      >
                        Sell
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeletingHolding(holding)}
                      className="flex h-7 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 dark:border-zinc-700"
                      aria-label="Delete gold record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      <Drawer open={buyDrawerOpen} onOpenChange={setBuyDrawerOpen}>
        <DrawerContent className="z-[80] mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-t-[36px] bg-white p-6 text-gray-900 dark:bg-zinc-900 dark:text-white">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-zinc-800">
            <DrawerTitle className="flex items-center gap-2 text-base font-black">
              <Gem className="h-5 w-5 text-amber-500" /> Record Gold Purchase
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setBuyDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleBuy} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Gold weight
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['ကျပ်သား', kyat, setKyat, undefined],
                  ['ပဲ', pae, setPae, 15],
                  ['ရွေး', yway, setYway, 7],
                ].map(([label, value, setter, max]) => (
                  <label
                    key={label as string}
                    className="text-center text-[10px] font-bold text-gray-400"
                  >
                    <input
                      type="number"
                      min="0"
                      max={max as number | undefined}
                      step="1"
                      value={value as string}
                      onChange={(event) =>
                        (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)
                      }
                      className="mb-1.5 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-center text-sm font-black outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    {label as string}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[10px] font-semibold text-gray-400">
                1 ကျပ်သား = 16 ပဲ = 128 ရွေး
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Total purchase price
              </label>
              <MoneyInput
                value={buyPrice}
                setValue={setBuyPrice}
                postfix={currency}
                placeholder="Enter total price"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Currency
                </label>
                <Select
                  value={currency}
                  onValueChange={(value) => setCurrency(value as CurrencyCode)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-gray-200 bg-gray-50 text-xs font-black dark:border-zinc-700 dark:bg-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[150]">
                    {Object.values(CURRENCIES).map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.flag} {item.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Purchase date
                </label>
                <DatePicker value={purchaseDate} onChange={setPurchaseDate} />
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              Available: {formatCurrency(walletBalances[currency] || 0, currency)}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Shop, purity, item details..."
                className="min-h-20 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs font-bold outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-white shadow-lg shadow-amber-500/20"
            >
              Save Purchase
            </button>
          </form>
        </DrawerContent>
      </Drawer>

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
    </div>
  );
}
