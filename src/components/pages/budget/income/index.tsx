'use client';

import React, { useState } from 'react';
import {
  Menu,
  Plus,
  TrendingUp,
  Trash2,
  X,
  Check,
  Zap,
  Coins,
  Sparkles,
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
import { DatePicker } from '@/components/ui/date-picker';

const PRESET_SOURCES = ['Freelance Gig', 'Tips', 'Performance Bonus', 'Gift / Reward', 'Side Business'];

export default function IncomePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('USDT');
  const [category, setCategory] = useState<string>('Side Business');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // Filter State
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | CurrencyCode>('ALL');

  const { budgetEntries = [], addIncome, deleteBudgetEntry } = useBudgetStore();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    addIncome({
      title: title.trim() || 'Extra Income',
      amount: numericAmount,
      currency,
      category,
      date,
      note: note.trim() || undefined,
    });

    // Reset Form
    setTitle('');
    setAmount('');
    setNote('');
    setIsDrawerOpen(false);
  };

  // Filtered Income Entries (type === 'income' and excluding Family category)
  const incomeEntries = budgetEntries.filter((entry) => {
    const isIncomeType = entry.type === 'income' && entry.category !== 'Family';
    const matchCurrency = filterCurrency === 'ALL' || entry.currency === filterCurrency;
    return isIncomeType && matchCurrency;
  });

  // Total Income Calculation per Currency (excluding Family transfers)
  const totalIncomePerCurrency = budgetEntries
    .filter((e) => e.type === 'income' && e.category !== 'Family')
    .reduce(
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
            Income Module
          </h1>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center transition-all"
            title="Log Extra Income"
          >
            <Plus className="w-6 h-6" />
          </button>
        </header>

        {/* HERO CARD: EXTRA INCOME OVERVIEW */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-800 text-white rounded-3xl p-6 shadow-xl shadow-emerald-600/20 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Extra & Freelance Earnings
              </p>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                Extra Income Records
              </h2>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-black rounded-full border border-white/20">
              {budgetEntries.filter((e) => e.type === 'income' && e.category !== 'Family').length} Entries
            </span>
          </div>

          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            Record money earned from freelance projects, tips, bonuses, side gigs, or gifts. Logged income automatically credits your budget wallet balance.
          </p>

          {/* Quick totals reference per currency */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15">
              <p className="text-[9px] font-bold text-emerald-200">USDT Earned</p>
              <p className="text-xs font-black truncate mt-0.5">
                {formatCurrency(totalIncomePerCurrency.USDT, 'USDT')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15">
              <p className="text-[9px] font-bold text-emerald-200">THB Earned</p>
              <p className="text-xs font-black truncate mt-0.5">
                {formatCurrency(totalIncomePerCurrency.THB, 'THB')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15">
              <p className="text-[9px] font-bold text-emerald-200">MMK Earned</p>
              <p className="text-xs font-black truncate mt-0.5">
                {formatCurrency(totalIncomePerCurrency.MMK, 'MMK')}
              </p>
            </div>
          </div>
        </div>

        {/* INCOME HISTORY LOG SECTION */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Income History Log
              </h2>
            </div>

            {/* Currency Filter Tabs */}
            <div className="flex gap-1 bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl">
              {(['ALL', 'USDT', 'THB', 'MMK'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setFilterCurrency(code)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[10px] font-black transition-all',
                    filterCurrency === code
                      ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-400 hover:text-gray-700',
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {incomeEntries.length > 0 ? (
            <div className="space-y-2.5">
              {incomeEntries.map((entry) => {
                const catObj = BUDGET_CATEGORIES.find((c) => c.name === entry.category);
                const catIcon = catObj ? catObj.icon : '💰';

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                        {catIcon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                            {entry.title}
                          </p>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 uppercase tracking-wider">
                            Income
                          </span>
                        </div>

                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                          {entry.category} • {entry.date} {entry.note ? `• ${entry.note}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(entry.amount, entry.currency)}
                      </span>

                      <button
                        type="button"
                        onClick={() => setDeleteEntryId(entry.id)}
                        className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
            {/* Title & Preset Chips */}
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

            {/* Amount & Currency Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Currency
                </label>
                <Select
                  value={currency}
                  onValueChange={(val) => setCurrency(val as CurrencyCode)}
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

            {/* Category */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
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

            {/* Date & Note */}
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
            <AlertDialogTitle className="text-base font-black">Delete Income Record?</AlertDialogTitle>
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

      {/* SIDEBAR DRAWER */}
      <BudgetSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
