'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  ArrowUpDown,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  History,
  Coins,
} from 'lucide-react';
import {
  useBudgetStore,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  DEFAULT_EXCHANGE_RATES,
} from '@/store/use-budget-store';
import { MoneyInput } from '@/components/ui/money-input';
import { ExportTableModal } from '../../_components/export-table-modal';
import { cn } from '@/utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CurrencyExchangePage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
      {/* WALLET BALANCES SUMMARY BAR */}
      <div className="grid grid-cols-4 gap-2">
        {(['USDT', 'THB', 'MMK', 'SGD'] as const).map((code) => (
          <div
            key={code}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800 shadow-xs text-center"
          >
            <span className="text-xs block font-extrabold text-gray-400">
              {CURRENCIES[code].flag} {code}
            </span>
            <span className="text-xs font-black text-gray-900 dark:text-white block mt-0.5 tabular-nums">
              {formatCurrency(walletBalances[code] || 0, code)}
            </span>
          </div>
        ))}
      </div>

      {/* 1. CURRENCY EXCHANGE CALCULATOR HERO CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Instant Currency Converter
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleExecuteExchange} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                From Currency
              </label>
              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                Available: {formatCurrency(availableBalance, fromCurrency)}
              </span>
            </div>

            <div className="flex gap-2">
              <Select
                value={fromCurrency}
                onValueChange={(val) => {
                  const selected = val as CurrencyCode;
                  setFromCurrency(selected);
                  if (selected === toCurrency) {
                    setToCurrency(selected === 'USDT' ? 'THB' : 'USDT');
                  }
                }}
              >
                <SelectTrigger className="w-36 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[95]">
                  {(['USDT', 'THB', 'MMK', 'SGD'] as const).map((code) => (
                    <SelectItem key={code} value={code} className="text-sm font-semibold py-2.5">
                      <span className="text-base mr-1">{CURRENCIES[code].flag}</span> {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <MoneyInput
                placeholder="Amount to send..."
                value={fromAmount}
                setValue={setFromAmount}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwap}
              className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 flex items-center justify-center transition-colors shrink-0"
              title="Swap Currencies"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 block mb-0.5">
                Exchange Rate (1 {fromCurrency} = ? {toCurrency})
              </label>
              <MoneyInput
                placeholder={`Rate (${defaultRate})`}
                value={customRate}
                setValue={setCustomRate}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              To Currency (You Receive)
            </label>

            <div className="flex gap-2">
              <Select
                value={toCurrency}
                onValueChange={(val) => {
                  const selected = val as CurrencyCode;
                  setToCurrency(selected);
                  if (selected === fromCurrency) {
                    setFromCurrency(selected === 'USDT' ? 'THB' : 'USDT');
                  }
                }}
              >
                <SelectTrigger className="w-36 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[95]">
                  {(['USDT', 'THB', 'MMK', 'SGD'] as const).map((code) => (
                    <SelectItem key={code} value={code} className="text-sm font-semibold py-2.5">
                      <span className="text-base mr-1">{CURRENCIES[code].flag}</span> {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1 px-4 py-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between">
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 tabular-nums">
                  +{formatCurrency(calculatedToAmount, toCurrency)}
                </span>
                <Coins className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" /> Convert & Execute Exchange
          </button>
        </form>
      </div>

      {/* 2. EXCHANGE HISTORY LOG SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Exchange History ({exchangeEntries.length})
            </h2>
          </div>

          <div className="flex bg-gray-200/60 dark:bg-zinc-800 p-1 rounded-xl gap-1">
            {(['ALL', 'USDT', 'THB', 'MMK', 'SGD'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setFilterCurrency(code)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10px] font-black transition-all',
                  filterCurrency === code
                    ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                )}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {exchangeEntries.length > 0 ? (
          <div className="space-y-2.5">
            {exchangeEntries.map((entry) => {
              const fromCode = entry.fromCurrency || entry.currency;
              const toCode = entry.toCurrency || 'THB';
              const fromAmt = entry.fromAmount || entry.amount;
              const toAmt = entry.toAmount || 0;

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xs space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-lg shrink-0 border border-purple-200/50 dark:border-purple-800/50">
                        💱
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug">
                          {entry.title}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                          {entry.date} • Currency Swap
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteBudgetEntry(entry.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-extrabold flex items-center gap-1 transition-colors shrink-0"
                      title="Delete Exchange Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-extrabold">
                    <div className="text-rose-600 dark:text-rose-400">
                      -{formatCurrency(fromAmt, fromCode)}
                    </div>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400 shrink-0 mx-1" />
                    <div className="text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(toAmt, toCode)}
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
