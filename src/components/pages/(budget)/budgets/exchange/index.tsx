'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Trash2,
  Calendar,
  Pencil,
} from 'lucide-react';
import {
  useBudgetStore,
  CurrencyCode,
  formatCurrency,
  DEFAULT_EXCHANGE_RATES,
  type BudgetEntry,
} from '@/store/use-budget-store';
import { ExportTableModal } from '../../_components/export-table-modal';
import { cn } from '@/utils/cn';
import { ExchangeBalanceCard } from './_components/exchange-balance-card';
import { ExchangeDrawer } from './_components/exchange-drawer';

export default function CurrencyExchangePage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    walletBalances,
    budgetEntries,
    executeCurrencyExchange,
    deleteBudgetEntry,
  } = useBudgetStore();

  // Exchange Form State
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USDT');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('THB');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [customRate, setCustomRate] = useState<string>('');
  const [filterCurrency, setFilterCurrency] = useState<CurrencyCode | 'ALL'>('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute active default exchange rate
  const rateKey = `${fromCurrency}_${toCurrency}`;
  const defaultRate = DEFAULT_EXCHANGE_RATES[rateKey] || 1;
  const activeRate = customRate !== '' ? parseFloat(customRate) || defaultRate : defaultRate;

  // Calculated To Amount
  const numFromAmount = parseFloat(fromAmount) || 0;
  const calculatedToAmount = numFromAmount * activeRate;
  const availableBalance = walletBalances[fromCurrency] || 0;

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const handleOpenEdit = (entry: BudgetEntry) => {
    setEditingEntryId(entry.id);
    setFromCurrency(entry.fromCurrency || entry.currency || 'USDT');
    setToCurrency(entry.toCurrency || 'THB');
    setFromAmount((entry.fromAmount || entry.amount || '').toString());
    setIsDrawerOpen(true);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setCustomRate('');
  };

  const handleExecuteExchange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (numFromAmount <= 0) {
      setErrorMsg('Please enter a valid amount to exchange.');
      return;
    }

    if (numFromAmount > availableBalance) {
      setErrorMsg(
        `Insufficient ${fromCurrency} balance. Available: ${formatCurrency(availableBalance, fromCurrency)}`,
      );
      return;
    }

    if (editingEntryId) {
      deleteBudgetEntry(editingEntryId);
      setEditingEntryId(null);
    }

    executeCurrencyExchange({
      fromCurrency,
      toCurrency,
      fromAmount: numFromAmount,
      toAmount: calculatedToAmount,
    });

    setSuccessMsg(
      `Successfully exchanged ${formatCurrency(numFromAmount, fromCurrency)} to ${formatCurrency(calculatedToAmount, toCurrency)}!`,
    );
    setFromAmount('');
    setIsDrawerOpen(false);

    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const exchangeEntries = budgetEntries
    .filter(
      (e) =>
        e.type === 'exchange' &&
        (filterCurrency === 'ALL' ||
          e.fromCurrency === filterCurrency ||
          e.toCurrency === filterCurrency ||
          e.currency === filterCurrency),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5">
      <ExchangeBalanceCard />

      {/* 1. HERO BALANCE CARD WITH ACTION BUTTONS */}
      <div className="bg-white dark:bg-black text-slate-950 dark:text-white rounded-[32px] p-6 shadow-xl border border-gray-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
            Instant Currency Converter
          </span>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-full flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Convert Currency
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          Swap funds instantly between USDT, THB, MMK, and SGD with custom or live market rates.
        </p>
      </div>

      <ExchangeDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        handleExecuteExchange={handleExecuteExchange}
        handleSwap={handleSwap}
        fields={{ fromCurrency, setFromCurrency, toCurrency, setToCurrency, fromAmount, setFromAmount, customRate, setCustomRate }}
        availableBalance={availableBalance}
        defaultRate={defaultRate}
        calculatedToAmount={calculatedToAmount}
        errorMsg={errorMsg}
        successMsg={successMsg}
      />

      {/* 2. TOP CURRENCY FILTER TAB BAR (MATCHING PHOTO 2) */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-1.5 rounded-full border border-gray-100 dark:border-zinc-800 shadow-xs">
        {(['ALL', 'USDT', 'THB', 'MMK', 'SGD'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setFilterCurrency(code)}
            className={cn(
              'flex-1 py-2 rounded-full text-xs font-black transition-all cursor-pointer text-center',
              filterCurrency === code
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white',
            )}
          >
            {code}
          </button>
        ))}
      </div>

      {/* 3. EXCHANGE HISTORY LOG SECTION */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Exchange History ({exchangeEntries.length})
          </h2>
          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
            Filter: {filterCurrency}
          </span>
        </div>

        {exchangeEntries.length > 0 ? (
          <div className="space-y-3">
            {exchangeEntries.map((entry) => {
              const fromCode = entry.fromCurrency || entry.currency;
              const toCode = entry.toCurrency || 'THB';
              const fromAmt = entry.fromAmount || entry.amount;
              const toAmt = entry.toAmount || 0;

              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-4 space-y-3 border border-gray-100 dark:border-zinc-800 shadow-xs"
                >
                  {/* Top Row: Icon + Title + Category & Exchange Amounts */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-base font-black shrink-0">
                        💱
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                            {entry.title}
                          </h3>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                            Swap
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-rose-500 tabular-nums">
                        -{formatCurrency(fromAmt, fromCode)}
                      </p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                        +{formatCurrency(toAmt, toCode)}
                      </p>
                    </div>
                  </div>

                  {/* Subtle Divider */}
                  <div className="border-t border-gray-100 dark:border-zinc-800/80" />

                  {/* Bottom Row: Date (Left) & Actions (Right) */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {entry.date}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(entry)}
                        className="px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBudgetEntry(entry.id)}
                        className="px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl mx-auto">
              💱
            </div>
            <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">
              No Exchange History
            </h3>
            <p className="text-[11px] font-bold text-gray-400 max-w-xs mx-auto">
              Use the instant converter above to perform currency conversions and track your exchange logs.
            </p>
          </div>
        )}
      </div>

      {/* EXPORT TABLE MODAL */}
      <ExportTableModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Currency Exchange History Statement"
        subtitle="Executed Currency Exchanges & Conversion Records"
        rows={exchangeEntries.map((e) => ({
          date: e.date,
          from: e.title,
          categoryOrType: `Swap (${e.fromCurrency} ➔ ${e.toCurrency})`,
          amount: e.fromAmount || e.amount,
          currency: e.fromCurrency || e.currency,
          isPositive: false,
        }))}
      />
    </div>
  );
}
