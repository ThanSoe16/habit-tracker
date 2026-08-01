'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  TrendingDown,
  Trash2,
  X,
  Check,
  Menu,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useBudgetStore,
  BUDGET_CATEGORIES,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
} from '@/store/useBudgetStore';
import { BudgetSidebarDrawerModal } from '../_components/BudgetSidebarDrawerModal';
import { cn } from '@/utils/cn';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parseISO } from 'date-fns';

export default function ExpensesPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | CurrencyCode>('ALL');
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  const { budgetEntries, addExpense, deleteBudgetEntry } = useBudgetStore();

  // Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCurrency, setExpCurrency] = useState<CurrencyCode>('USDT');
  const [expCategory, setExpCategory] = useState('Food & Groceries');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amt) || amt <= 0) return;

    addExpense({
      title: expTitle.trim(),
      amount: amt,
      currency: expCurrency,
      category: expCategory,
      date: expDate,
    });

    setExpTitle('');
    setExpAmount('');
    setIsExpenseDrawerOpen(false);
  };

  const getCategoryEmoji = (catName: string) => {
    const found = BUDGET_CATEGORIES.find((c) => c.name === catName);
    return found ? found.icon : '💸';
  };

  const filteredEntries = budgetEntries.filter((e) => {
    const isExpense = e.type === 'expense';
    const matchCurrency = filterCurrency === 'ALL' || e.currency === filterCurrency;
    return isExpense && matchCurrency;
  });

  // Expense entries (type === 'expense')
  const expenseEntriesOnly = budgetEntries.filter((e) => e.type === 'expense');

  // Total expenses calculation per currency
  const totalExpensePerCurrency = expenseEntriesOnly.reduce(
    (acc, entry) => {
      acc[entry.currency] = (acc[entry.currency] || 0) + entry.amount;
      return acc;
    },
    { USDT: 0, THB: 0, MMK: 0 } as Record<CurrencyCode, number>,
  );

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 text-gray-900 dark:text-white pb-32">
      <div className="w-full max-w-lg mx-auto p-4 space-y-5">
        {/* Header */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Expenses & Activity Log
          </h1>

          <button
            type="button"
            onClick={() => setIsExpenseDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/30 transition-transform active:scale-95"
            title="Log Expense"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {/* HERO CARD: EXPENSE & ACTIVITY OVERVIEW */}
        <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-red-800 text-white rounded-3xl p-6 shadow-xl shadow-rose-600/20 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-200 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Spending & Activity Summary
              </p>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                Total Expenses Overview
              </h2>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-black rounded-full border border-white/20">
              {expenseEntriesOnly.length} Expenses
            </span>
          </div>

          <p className="text-xs text-rose-100 font-medium leading-relaxed">
            Summary of all logged expenses across active currencies. Logged expenses automatically deduct from your wallet balances.
          </p>

          {/* Quick Expense Totals Per Currency */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
              <p className="text-[9px] font-black text-rose-200 uppercase tracking-wider">
                USDT Spent
              </p>
              <p className="text-xs font-black truncate mt-0.5 text-white tabular-nums">
                -{formatCurrency(totalExpensePerCurrency.USDT, 'USDT')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
              <p className="text-[9px] font-black text-rose-200 uppercase tracking-wider">
                THB Spent
              </p>
              <p className="text-xs font-black truncate mt-0.5 text-white tabular-nums">
                -{formatCurrency(totalExpensePerCurrency.THB, 'THB')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
              <p className="text-[9px] font-black text-rose-200 uppercase tracking-wider">
                MMK Spent
              </p>
              <p className="text-xs font-black truncate mt-0.5 text-white tabular-nums">
                -{formatCurrency(totalExpensePerCurrency.MMK, 'MMK')}
              </p>
            </div>
          </div>
        </div>

        {/* Currency Filter Tabs */}
        <div className="flex gap-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
          {(['ALL', 'USDT', 'THB', 'MMK'] as const).map((code) => (
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

        {/* Activity Entries List */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Expense Log ({filteredEntries.length})
            </h2>
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
              Filter: {filterCurrency}
            </span>
          </div>

          {filteredEntries.length > 0 ? (
            <div className="space-y-2.5">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between gap-3 group hover:border-rose-300 dark:hover:border-rose-800 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gray-200/60 dark:bg-zinc-700/60 text-gray-800 dark:text-gray-200 flex items-center justify-center text-xl shrink-0 border border-gray-200/40 dark:border-zinc-600">
                      {getCategoryEmoji(entry.category)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-700 text-gray-500 dark:text-gray-300 border border-gray-200/60 dark:border-zinc-600">
                          {entry.category}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {entry.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        'font-black text-sm tabular-nums',
                        entry.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : entry.type === 'exchange'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-rose-600 dark:text-rose-400',
                      )}
                    >
                      {entry.type === 'income' ? '+' : entry.type === 'expense' ? '-' : '💱'}
                      {formatCurrency(entry.amount, entry.currency)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setDeleteEntryId(entry.id)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                      title="Delete activity log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto">
                💸
              </div>
              <p className="text-xs text-gray-400 font-bold">
                No recorded activity for {filterCurrency}.
              </p>
              <button
                type="button"
                onClick={() => setIsExpenseDrawerOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-500/25"
              >
                + Log New Expense
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ADD EXPENSE DRAWER */}
      <Drawer open={isExpenseDrawerOpen} onOpenChange={setIsExpenseDrawerOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-600" /> Log Expense
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsExpenseDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Expense Description
              </label>
              <input
                type="text"
                required
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="e.g. Groceries, Restaurant bill..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Currency
                </label>
                <Select
                  value={expCurrency}
                  onValueChange={(val) => setExpCurrency(val as CurrencyCode)}
                >
                  <SelectTrigger className="w-full h-[46px] rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[95]">
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                      <SelectItem key={c} value={c} className="text-xs font-bold">
                        {CURRENCIES[c].flag} {c}
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
              <Select value={expCategory} onValueChange={setExpCategory}>
                <SelectTrigger className="w-full h-[46px] rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[95]">
                  {BUDGET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name} className="text-xs font-bold">
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Date
              </label>
              <DatePicker value={expDate} onChange={setExpDate} />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-500/25 transition-all text-xs flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4" /> Save Expense
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* DELETE ACTIVITY LOG DIALOG */}
      <AlertDialog open={!!deleteEntryId} onOpenChange={() => setDeleteEntryId(null)}>
        <AlertDialogContent className="z-[90] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-xs mx-auto text-gray-900 dark:text-white">
          <AlertDialogHeader className="space-y-2 text-center sm:text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-1">
              <Trash2 className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-extrabold text-gray-900 dark:text-white">
              Delete Entry?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Are you sure you want to remove this log entry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setDeleteEntryId(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 font-bold text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteEntryId) deleteBudgetEntry(deleteEntryId);
                setDeleteEntryId(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sidebar Drawer */}
      <BudgetSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
