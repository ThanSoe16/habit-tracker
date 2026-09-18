'use client';

import type { FormEvent } from 'react';
import { Check, TrendingUp, X } from 'lucide-react';
import { BUDGET_CATEGORIES, CURRENCIES, type CurrencyCode } from '@/store/use-budget-store';
import { cn } from '@/utils/cn';
import { MoneyInput } from '@/components/ui/money-input';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

const PRESET_SOURCES = [
  'Freelance Gig',
  'Tips',
  'Performance Bonus',
  'Gift / Reward',
  'Side Business',
];

type IncomeFields = {
  title: string;
  setTitle: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  currency: CurrencyCode;
  setCurrency: (value: CurrencyCode) => void;
  category: string;
  setCategory: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
};

export function IncomeDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  handleFormSubmit,
  fields,
}: {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  handleFormSubmit: (event: FormEvent) => void;
  fields: IncomeFields;
}) {
  const {
    title,
    setTitle,
    amount,
    setAmount,
    currency,
    setCurrency,
    category,
    setCategory,
    date,
    setDate,
    note,
    setNote,
  } = fields;
  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <DrawerTitle className="text-base font-black flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Log Extra Income
          </DrawerTitle>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Income Source / Title
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_SOURCES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setTitle(src)}
                  className={cn(
                    'px-3 py-1 rounded-xl text-[10px] font-black transition-all border',
                    title === src
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100',
                  )}
                >
                  {src}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Freelance Web Project, Client Tip..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Amount
              </label>
              <MoneyInput
                value={amount}
                setValue={setAmount}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Currency
              </label>
              <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
                <SelectTrigger className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[95]">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                    <SelectItem key={c} value={c} className="text-sm font-semibold py-2.5">
                      <span className="text-base mr-1">{CURRENCIES[c].flag}</span> {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[95]">
                {BUDGET_CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat.name}
                    value={cat.name}
                    className="text-sm font-semibold py-2.5"
                  >
                    <span className="text-base mr-1">{cat.icon}</span> {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Date
            </label>
            <DatePicker value={date} onChange={setDate} />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Note / Remark (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid via Paypal, bonus for completing milestone early..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-xs flex items-center justify-center gap-2 mt-2"
          >
            <Check className="w-4 h-4" /> Save Extra Income
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
