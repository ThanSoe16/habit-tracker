'use client';

import type { FormEvent } from 'react';
import { AlertCircle, ArrowRightLeft, ArrowUpDown, CheckCircle2, Coins, X } from 'lucide-react';
import { CURRENCIES, formatCurrency, type CurrencyCode } from '@/store/use-budget-store';
import { MoneyInput } from '@/components/ui/money-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';

type ExchangeFields = {
  fromCurrency: CurrencyCode;
  setFromCurrency: (value: CurrencyCode) => void;
  toCurrency: CurrencyCode;
  setToCurrency: (value: CurrencyCode) => void;
  fromAmount: string;
  setFromAmount: (value: string) => void;
  customRate: string;
  setCustomRate: (value: string) => void;
};

export function ExchangeDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  handleExecuteExchange,
  handleSwap,
  fields,
  availableBalance,
  defaultRate,
  calculatedToAmount,
  errorMsg,
  successMsg,
}: {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  handleExecuteExchange: (event: FormEvent) => void;
  handleSwap: () => void;
  fields: ExchangeFields;
  availableBalance: number;
  defaultRate: number;
  calculatedToAmount: number;
  errorMsg: string | null;
  successMsg: string | null;
}) {
  const {
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    fromAmount,
    setFromAmount,
    customRate,
    setCustomRate,
  } = fields;
  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerContent className="bg-white dark:bg-zinc-950 text-slate-950 dark:text-white p-6 max-w-lg mx-auto rounded-t-[32px] space-y-5 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <DrawerTitle className="text-sm font-extrabold text-gray-900 dark:text-white">
              Instant Currency Converter
            </DrawerTitle>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
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
                <SelectContent className="z-[105]">
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
              className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
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
                <SelectContent className="z-[105]">
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
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" /> Convert & Execute Exchange
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
