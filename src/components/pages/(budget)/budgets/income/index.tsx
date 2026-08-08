'use client';

import React, { useState } from 'react';
import { Plus, TrendingUp, Trash2, X, Check, Sparkles, Pencil, Calendar } from 'lucide-react';
import {
  useBudgetStore,
  BUDGET_CATEGORIES,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  BudgetEntry,
} from '@/store/use-budget-store';
import { cn } from '@/utils/cn';
import { MoneyInput } from '@/components/ui/money-input';
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

export default function IncomePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('USDT');
  const [category, setCategory] = useState<string>('Side Business');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  const { budgetEntries = [], addIncome, deleteBudgetEntry, walletBalances } = useBudgetStore();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USDT');
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | CurrencyCode>('ALL');
  const currentBalance = walletBalances[selectedCurrency] || 0;

  const resetForm = () => {
    setEditingEntryId(null);
    setTitle('');
    setAmount('');
    setNote('');
    setCurrency('USDT');
    setCategory('Side Business');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenEdit = (entry: BudgetEntry) => {
    setEditingEntryId(entry.id);
    setTitle(entry.title);
    setAmount(entry.amount.toString());
    setCurrency(entry.currency);
    setCategory(entry.category);
    setDate(entry.date);
    setNote(entry.note || '');
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    if (editingEntryId) {
      deleteBudgetEntry(editingEntryId);
    }

    addIncome({
      title: title.trim() || 'Extra Income',
      amount: numericAmount,
      currency,
      category,
      date,
      note: note.trim() || undefined,
    });

    resetForm();
    setIsDrawerOpen(false);
  };

  const incomeEntries = budgetEntries
    .filter((entry) => {
      const isIncomeType = entry.type === 'income' && entry.category !== 'Family';
      const matchCurrency = filterCurrency === 'ALL' || entry.currency === filterCurrency;
      return isIncomeType && matchCurrency;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncomePerCurrency = budgetEntries
    .filter((e) => e.type === 'income' && e.category !== 'Family')
    .reduce(
      (acc, entry) => {
        acc[entry.currency] = (acc[entry.currency] || 0) + entry.amount;
        return acc;
      },
      { USDT: 0, THB: 0, MMK: 0, SGD: 0 } as Record<CurrencyCode, number>,
    );

  return (
    <div className="space-y-5">
      {/* 1. HERO BALANCE CARD (MATCHING MAIN DASHBOARD HEADER STYLE WITHOUT 4 NAV BUTTONS) */}
      <div className="bg-white dark:bg-black text-slate-950 dark:text-white rounded-[32px] p-6 shadow-xl border border-gray-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Current Balance</span>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log Income
          </button>
        </div>

        <div className="text-center space-y-2 pt-1 pb-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white tabular-nums">
            {formatCurrency(currentBalance, selectedCurrency)}
          </h1>

          {/* Currency Dropdown Selector Pill */}
          <div className="flex justify-center pt-1">
            <Select
              value={selectedCurrency}
              onValueChange={(val) => {
                const code = val as CurrencyCode;
                setSelectedCurrency(code);
                setCurrency(code);
              }}
            >
              <SelectTrigger className="h-9 w-auto px-4 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-slate-950 dark:text-white rounded-full text-sm font-semibold gap-1.5 focus:ring-0 focus:outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl z-[100]">
                {Object.values(CURRENCIES).map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-sm font-semibold py-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800">
                    <span className="text-base mr-1">{c.flag}</span> {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* INCOME HISTORY LOG SECTION */}
      <div className="flex gap-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
        {(['ALL', 'USDT', 'THB', 'MMK', 'SGD'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setFilterCurrency(code)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-black transition-all',
              filterCurrency === code
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-white',
            )}
          >
            {code}
          </button>
        ))}
      </div>

      <div>
        {incomeEntries.length > 0 ? (
          <div className="space-y-2.5">
            {incomeEntries.map((entry) => {
              const catObj = BUDGET_CATEGORIES.find((c) => c.name === entry.category);
              const catIcon = catObj ? catObj.icon : '💰';

              return (
                <div
                  key={entry.id}
                  className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 border border-gray-100 dark:border-zinc-800 flex flex-col gap-2.5 group hover:border-emerald-300 dark:hover:border-emerald-800 transition-all shadow-2xs"
                >
                  {/* Top Row: Icon + Title + Category & Amount */}
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-lg shrink-0 border border-emerald-200/40 dark:border-emerald-900/40">
                        {catIcon}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                          {entry.title}
                        </h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 inline-block mt-0.5">
                          {entry.category}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="font-black text-base tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(entry.amount, entry.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Next Line: Date & Action Buttons (Edit + Delete) */}
                  <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-zinc-700/50 pt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {entry.date}
                        {entry.note ? ` • ${entry.note}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(entry)}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-extrabold flex items-center gap-1 border border-gray-200/60 dark:border-zinc-600 transition-colors shadow-2xs"
                        title="Edit Record"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteEntryId(entry.id)}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-extrabold flex items-center gap-1 border border-gray-200/60 dark:border-zinc-600 transition-colors shadow-2xs"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-8">
            No income entries logged yet. Tap &quot;+ Log Income&quot; to add extra earnings!
          </p>
        )}
      </div>

      {/* LOG EXTRA INCOME DRAWER */}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!deleteEntryId} onOpenChange={() => setDeleteEntryId(null)}>
        <AlertDialogContent className="z-[90] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-xs mx-auto text-gray-900 dark:text-white">
          <AlertDialogHeader className="space-y-2 text-center sm:text-center">
            <AlertDialogTitle className="text-base font-black">
              Delete Income Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Deleting this record will deduct the credited amount from your budget wallet balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4 sm:flex-row sm:justify-center">
            <AlertDialogCancel className="flex-1 rounded-2xl text-xs font-extrabold border-gray-200 dark:border-zinc-700 m-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteEntryId) {
                  deleteBudgetEntry(deleteEntryId);
                  setDeleteEntryId(null);
                }
              }}
              className="flex-1 rounded-2xl text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white m-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
