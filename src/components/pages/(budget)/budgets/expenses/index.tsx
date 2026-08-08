'use client';

import React, { useState } from 'react';
import {
  Plus,
  TrendingDown,
  Trash2,
  X,
  Check,
  Pencil,
  Calendar,
} from 'lucide-react';
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

export default function ExpensesPage() {
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | CurrencyCode>('ALL');
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  const { budgetEntries, addExpense, deleteBudgetEntry, walletBalances } = useBudgetStore();

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCurrency, setExpCurrency] = useState<CurrencyCode>('USDT');
  const [expCategory, setExpCategory] = useState('Food & Groceries');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USDT');

  const currentBalance = walletBalances[selectedCurrency] || 0;
  const parsedExpAmount = parseFloat(expAmount) || 0;
  const isOverBudget = parsedExpAmount > (walletBalances[expCurrency] || 0) && !editingEntryId;

  const resetExpenseForm = () => {
    setEditingEntryId(null);
    setExpTitle('');
    setExpAmount('');
    setExpCurrency('USDT');
    setExpCategory('Food & Groceries');
    setExpDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenEditExpense = (entry: BudgetEntry) => {
    setEditingEntryId(entry.id);
    setExpTitle(entry.title);
    setExpAmount(entry.amount.toString());
    setExpCurrency(entry.currency);
    setExpCategory(entry.category);
    setExpDate(entry.date);
    setIsExpenseDrawerOpen(true);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amt) || amt <= 0) return;
    if (isOverBudget) return;

    if (editingEntryId) {
      deleteBudgetEntry(editingEntryId);
    }

    addExpense({
      title: expTitle.trim(),
      amount: amt,
      currency: expCurrency,
      category: expCategory,
      date: expDate,
    });

    resetExpenseForm();
    setIsExpenseDrawerOpen(false);
  };

  const getCategoryEmoji = (catName: string) => {
    const found = BUDGET_CATEGORIES.find((c) => c.name === catName);
    return found ? found.icon : '💸';
  };

  const expenseEntriesOnly = budgetEntries.filter(
    (e) => e.type === 'expense' && e.category !== 'Family',
  );

  const totalExpensePerCurrency = expenseEntriesOnly.reduce(
    (acc, entry) => {
      acc[entry.currency] = (acc[entry.currency] || 0) + entry.amount;
      return acc;
    },
    { USDT: 0, THB: 0, MMK: 0, SGD: 0 } as Record<CurrencyCode, number>,
  );

  const filteredEntries = budgetEntries
    .filter((entry) => {
      if (entry.type !== 'expense') return false;
      if (entry.category === 'Family') return false;
      if (filterCurrency !== 'ALL' && entry.currency !== filterCurrency) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5">
      {/* 1. HERO BALANCE CARD (MATCHING MAIN DASHBOARD HEADER STYLE WITHOUT 4 NAV BUTTONS) */}
      <div className="bg-white dark:bg-black text-slate-950 dark:text-white rounded-[32px] p-6 shadow-xl border border-gray-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Current Balance</span>
          <button
            type="button"
            onClick={() => setIsExpenseDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log Expense
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
                setExpCurrency(code);
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

      {/* Currency Filter Tabs */}
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
                className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 border border-gray-100 dark:border-zinc-700/60 flex flex-col gap-2.5 group hover:border-rose-300 dark:hover:border-rose-800 transition-all shadow-2xs"
              >
                {/* Top Row: Icon + Title + Category & Amount */}
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gray-200/60 dark:bg-zinc-700/60 text-gray-800 dark:text-gray-200 flex items-center justify-center text-lg shrink-0 border border-gray-200/40 dark:border-zinc-600">
                      {getCategoryEmoji(entry.category)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                        {entry.title}
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-700 text-gray-500 dark:text-gray-300 border border-gray-200/60 dark:border-zinc-600 inline-block mt-0.5">
                        {entry.category}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={cn(
                        'font-black text-base tabular-nums',
                        entry.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : entry.type === 'exchange'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-red-500 dark:text-red-400',
                      )}
                    >
                      {entry.type === 'income' ? '+' : entry.type === 'expense' ? '-' : '💱'}
                      {formatCurrency(entry.amount, entry.currency)}
                    </span>
                  </div>
                </div>

                {/* Next Line: Date & Action Buttons (Edit + Delete) */}
                <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-zinc-700/50 pt-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{entry.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditExpense(entry)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[11px] font-extrabold flex items-center gap-1 border border-gray-200/60 dark:border-zinc-600 transition-colors shadow-2xs"
                      title="Edit Expense"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteEntryId(entry.id)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-extrabold flex items-center gap-1 border border-gray-200/60 dark:border-zinc-600 transition-colors shadow-2xs"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
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

          {/* Current Balance Info */}
          <div className={cn(
            'flex items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-bold',
            isOverBudget
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
          )}>
            <span>{CURRENCIES[expCurrency].flag} {expCurrency} Balance</span>
            <span className="font-black text-sm">{formatCurrency(currentBalance, expCurrency)}</span>
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
                <MoneyInput
                  value={expAmount}
                  setValue={setExpAmount}
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
              <Select value={expCategory} onValueChange={setExpCategory}>
                <SelectTrigger className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[95]">
                  {BUDGET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name} className="text-sm font-semibold py-2.5">
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
              <DatePicker value={expDate} onChange={setExpDate} />
            </div>

            {isOverBudget && parsedExpAmount > 0 && (
              <p className="text-[11px] font-bold text-red-500 text-center">
                ⚠️ Amount exceeds your {expCurrency} balance of {formatCurrency(currentBalance, expCurrency)}
              </p>
            )}

            <button
              type="submit"
              disabled={isOverBudget && parsedExpAmount > 0}
              className={cn(
                'w-full py-3.5 font-extrabold rounded-2xl shadow-lg transition-all text-xs flex items-center justify-center gap-2 mt-2',
                isOverBudget && parsedExpAmount > 0
                  ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-not-allowed shadow-none'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25'
              )}
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
    </div>
  );
}
