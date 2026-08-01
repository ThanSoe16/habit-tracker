'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  X,
  Check,
  ArrowRightLeft,
  Calendar as CalendarIcon,
  Pencil,
  Power,
  Sparkles,
  HelpCircle,
  Coins,
} from 'lucide-react';
import {
  useBudgetStore,
  BUDGET_CATEGORIES,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  MonthlySalary,
  DEFAULT_EXCHANGE_RATES,
} from '@/store/useBudgetStore';
import { BudgetSidebarDrawerModal } from './_components/BudgetSidebarDrawerModal';
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

export default function BudgetPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExchangeDrawerOpen, setIsExchangeDrawerOpen] = useState(false);
  const [isSalaryDrawerOpen, setIsSalaryDrawerOpen] = useState(false);
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);

  // Editing Salary & Balance States
  const [editingSalary, setEditingSalary] = useState<MonthlySalary | null>(null);
  const [editingBalCurrency, setEditingBalCurrency] = useState<CurrencyCode | null>(null);
  const [balInput, setBalInput] = useState<string>('');

  // Filter State
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | CurrencyCode>('ALL');

  // Confirmation Delete & Disable States
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [deleteSalaryId, setDeleteSalaryId] = useState<string | null>(null);
  const [disableTargetSalary, setDisableTargetSalary] = useState<MonthlySalary | null>(null);
  const [disableReasonInput, setDisableReasonInput] = useState<string>('');

  const {
    walletBalances,
    monthlySalaries,
    budgetEntries,
    addMonthlySalary,
    updateMonthlySalary,
    toggleMonthlySalary,
    deleteMonthlySalary,
    processMonthlySalaryPayout,
    addExpense,
    deleteBudgetEntry,
    executeCurrencyExchange,
    updateWalletBalance,
  } = useBudgetStore();

  // Exchange Form State
  const [exchangeFrom, setExchangeFrom] = useState<CurrencyCode>('USDT');
  const [exchangeTo, setExchangeTo] = useState<CurrencyCode>('THB');
  const [exchangeFromAmount, setExchangeFromAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('35.5');

  // Calculated received amount
  const calculatedToAmount =
    (parseFloat(exchangeFromAmount) || 0) * (parseFloat(exchangeRate) || 1);

  const handleExchangeFromChange = (c: CurrencyCode) => {
    setExchangeFrom(c);
    if (c === exchangeTo) {
      const alt = c === 'USDT' ? 'THB' : c === 'THB' ? 'MMK' : 'USDT';
      setExchangeTo(alt);
      setExchangeRate(String(DEFAULT_EXCHANGE_RATES[`${c}_${alt}`] || 1));
    } else {
      setExchangeRate(String(DEFAULT_EXCHANGE_RATES[`${c}_${exchangeTo}`] || 1));
    }
  };

  const handleExchangeToChange = (c: CurrencyCode) => {
    setExchangeTo(c);
    setExchangeRate(String(DEFAULT_EXCHANGE_RATES[`${exchangeFrom}_${c}`] || 1));
  };

  const handleExecuteExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromAmt = parseFloat(exchangeFromAmount);
    if (isNaN(fromAmt) || fromAmt <= 0) return;

    if ((walletBalances[exchangeFrom] || 0) < fromAmt) {
      alert(`Insufficient ${exchangeFrom} balance for this exchange.`);
      return;
    }

    executeCurrencyExchange({
      fromCurrency: exchangeFrom,
      toCurrency: exchangeTo,
      fromAmount: fromAmt,
      toAmount: calculatedToAmount,
    });

    setExchangeFromAmount('');
    setIsExchangeDrawerOpen(false);
  };

  // Salary Form State
  const [salTitle, setSalTitle] = useState('');
  const [salAmount, setSalAmount] = useState('');
  const [salCurrency, setSalCurrency] = useState<CurrencyCode>('USDT');
  const [salCategory, setSalCategory] = useState('Salary');
  const [salNote, setSalNote] = useState('');

  const openAddSalary = () => {
    setEditingSalary(null);
    setSalTitle('');
    setSalAmount('');
    setSalCurrency('USDT');
    setSalCategory('Salary');
    setSalNote('');
    setIsSalaryDrawerOpen(true);
  };

  const openEditSalary = (sal: MonthlySalary) => {
    setEditingSalary(sal);
    setSalTitle(sal.title);
    setSalAmount(String(sal.amount));
    setSalCurrency(sal.currency);
    setSalCategory(sal.category);
    setSalNote(sal.note || '');
    setIsSalaryDrawerOpen(true);
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(salAmount);
    if (!salTitle.trim() || isNaN(amt) || amt <= 0) return;

    if (editingSalary) {
      updateMonthlySalary(editingSalary.id, {
        title: salTitle.trim(),
        amount: amt,
        currency: salCurrency,
        category: salCategory,
        note: salNote.trim() || undefined,
      });
    } else {
      addMonthlySalary({
        title: salTitle.trim(),
        amount: amt,
        currency: salCurrency,
        category: salCategory,
        isEnabled: true,
        note: salNote.trim() || undefined,
      });
    }

    setIsSalaryDrawerOpen(false);
  };

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
    if (filterCurrency === 'ALL') return true;
    return e.currency === filterCurrency;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 text-gray-900 dark:text-white pb-32">
      <div className="w-full max-w-lg mx-auto p-4 space-y-5">
        {/* Header */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Budget Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Budget & Currency
          </h1>

          <button
            type="button"
            onClick={processMonthlySalaryPayout}
            className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black flex items-center gap-1 hover:bg-emerald-100 transition-colors"
            title="Process 1st of Month Salary Credit Now"
          >
            <Sparkles className="w-3.5 h-3.5" /> 1st Payout
          </button>
        </header>

        {/* SECTION 1: CURRENT BUDGET TABLE (3 CURRENCY WALLETS) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Current Budget Table
                </h2>
                <p className="text-[10px] text-gray-400 font-bold">3 Active Currencies</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExchangeDrawerOpen(true)}
              className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-indigo-500/30 transition-transform active:scale-95"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Exchange
            </button>
          </div>

          {/* 3 Wallet Cards */}
          <div className="grid grid-cols-1 gap-2.5">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const info = CURRENCIES[code];
              const bal = walletBalances[code] || 0;
              return (
                <div
                  key={code}
                  className="bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-zinc-800/80 dark:to-zinc-800/40 p-4 rounded-2xl border border-gray-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.flag}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {info.name}
                      </p>
                      <p className="text-lg font-black text-gray-900 dark:text-white tabular-nums">
                        {formatCurrency(bal, code)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingBalCurrency(code);
                      setBalInput(String(bal));
                    }}
                    className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    Set Bal
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: MONTHLY SALARY TABLE (TEMPLATES & RECURRING) */}
        <div id="section-salary" className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <CalendarIcon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Monthly Salary Table
                </h2>
                <p className="text-[10px] text-gray-400 font-bold">Auto-credits on 1st of every month</p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddSalary}
              className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm shadow-purple-500/30 transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Add Salary
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 p-3 rounded-2xl text-[11px] text-purple-900 dark:text-purple-200 font-medium flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <span>
              Editing or disabling a salary template will <strong>not affect</strong> funds already credited to your Current Budget.
            </span>
          </div>

          {/* Salary Items Table/List */}
          {monthlySalaries.length > 0 ? (
            <div className="space-y-2.5">
              {monthlySalaries.map((sal) => (
                <div
                  key={sal.id}
                  className={cn(
                    'p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all',
                    sal.isEnabled
                      ? 'bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700'
                      : 'bg-gray-50/40 dark:bg-zinc-800/30 border-gray-100 dark:border-zinc-800/60 opacity-60',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-lg shrink-0">
                      {getCategoryEmoji(sal.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                          {sal.title}
                        </p>
                        <span
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                            sal.isEnabled
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-400',
                          )}
                        >
                          {sal.isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {sal.category} • Every 1st of Month
                      </p>
                      {!sal.isEnabled && sal.disabledReason && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold mt-0.5">
                          Reason: {sal.disabledReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-xs text-gray-900 dark:text-white tabular-nums">
                      {formatCurrency(sal.amount, sal.currency)}
                    </span>

                    {/* Enable/Disable Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (sal.isEnabled) {
                          setDisableTargetSalary(sal);
                          setDisableReasonInput('');
                        } else {
                          toggleMonthlySalary(sal.id);
                        }
                      }}
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                        sal.isEnabled
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-200 dark:bg-zinc-700 text-gray-400',
                      )}
                      title={sal.isEnabled ? 'Disable Salary' : 'Enable Salary'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditSalary(sal)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-500 hover:text-blue-500 flex items-center justify-center transition-colors"
                      title="Edit Salary"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteSalaryId(sal.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                      title="Delete Salary Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-bold text-center py-4">
              No salary templates configured. Tap &quot;Add Salary&quot; to define monthly earnings!
            </p>
          )}
        </div>

        {/* SECTION 3: EXPENSE & ACTIVITY LOG TABLE */}
        <div id="section-expenses" className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Expense & Activity Log
                </h2>
                <p className="text-[10px] text-gray-400 font-bold">Transactions & Currency Exchanges</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpenseDrawerOpen(true)}
              className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm shadow-rose-500/30 transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Log Expense
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 bg-gray-50 dark:bg-zinc-800 p-1 rounded-2xl border border-gray-100 dark:border-zinc-700">
            {(['ALL', 'USDT', 'THB', 'MMK'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setFilterCurrency(code)}
                className={cn(
                  'flex-1 py-1.5 rounded-xl text-xs font-black transition-all',
                  filterCurrency === code
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-white',
                )}
              >
                {code}
              </button>
            ))}
          </div>

          {/* Activity Items List */}
          {filteredEntries.length > 0 ? (
            <div className="space-y-2.5">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-200/60 dark:bg-zinc-700/60 text-gray-800 dark:text-gray-200 flex items-center justify-center text-lg shrink-0">
                      {getCategoryEmoji(entry.category)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-700 text-gray-500 dark:text-gray-300 border border-gray-200/60 dark:border-zinc-600">
                          {entry.category}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {entry.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        'font-black text-xs tabular-nums',
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
                      className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                      title="Delete activity log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-bold text-center py-6">
              No activity entries for {filterCurrency}.
            </p>
          )}
        </div>
      </div>

      {/* CURRENCY EXCHANGE DRAWER */}
      <Drawer open={isExchangeDrawerOpen} onOpenChange={setIsExchangeDrawerOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Currency Exchange
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExchangeDrawerOpen(false);
                  router.push('/budget/exchange');
                }}
                className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] hover:bg-purple-100 transition-colors"
              >
                Full History ➔
              </button>
              <button
                type="button"
                onClick={() => setIsExchangeDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleExecuteExchangeSubmit} className="space-y-4">
            {/* From Currency & Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                <span>From Currency</span>
                <span>Available: {formatCurrency(walletBalances[exchangeFrom] || 0, exchangeFrom)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Select
                  value={exchangeFrom}
                  onValueChange={(val) => handleExchangeFromChange(val as CurrencyCode)}
                >
                  <SelectTrigger className="w-[125px] h-[46px] rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs font-black">
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
                <input
                  type="number"
                  step="0.01"
                  required
                  value={exchangeFromAmount}
                  onChange={(e) => setExchangeFromAmount(e.target.value)}
                  placeholder="Amount to send..."
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Exchange Rate Input */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Exchange Rate (1 {exchangeFrom} = ? {exchangeTo})
              </label>
              <input
                type="number"
                step="any"
                required
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* To Currency & Calculated Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400">To Currency (You Receive)</label>
              <div className="flex gap-2 items-center">
                <Select
                  value={exchangeTo}
                  onValueChange={(val) => handleExchangeToChange(val as CurrencyCode)}
                >
                  <SelectTrigger className="w-[125px] h-[46px] rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs font-black">
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
                <div className="flex-1 px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 rounded-2xl text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 flex items-center">
                  +{formatCurrency(calculatedToAmount, exchangeTo)}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-xs flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4" /> Convert & Exchange
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* ADD / EDIT SALARY DRAWER */}
      <Drawer open={isSalaryDrawerOpen} onOpenChange={setIsSalaryDrawerOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600" />{' '}
              {editingSalary ? 'Edit Monthly Salary' : 'Add Monthly Salary Template'}
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsSalaryDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSalarySubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Salary Title
              </label>
              <input
                type="text"
                required
                value={salTitle}
                onChange={(e) => setSalTitle(e.target.value)}
                placeholder="e.g. Main Job Salary, Retainer"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  value={salAmount}
                  onChange={(e) => setSalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Currency
                </label>
                <Select
                  value={salCurrency}
                  onValueChange={(val) => setSalCurrency(val as CurrencyCode)}
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
              <Select value={salCategory} onValueChange={setSalCategory}>
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
                Note (Optional)
              </label>
              <input
                type="text"
                value={salNote}
                onChange={(e) => setSalNote(e.target.value)}
                placeholder="e.g. Credited 1st of month"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-500/25 transition-all text-xs flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4" /> {editingSalary ? 'Update Salary' : 'Save Salary Template'}
            </button>
          </form>
        </DrawerContent>
      </Drawer>

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

      {/* DELETE SALARY TEMPLATE DIALOG */}
      <AlertDialog open={!!deleteSalaryId} onOpenChange={() => setDeleteSalaryId(null)}>
        <AlertDialogContent className="z-[90] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-xs mx-auto text-gray-900 dark:text-white">
          <AlertDialogHeader className="space-y-2 text-center sm:text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-1">
              <Trash2 className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-extrabold text-gray-900 dark:text-white">
              Delete Salary Template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
              This will remove future payouts. Your current budget balance will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setDeleteSalaryId(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 font-bold text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSalaryId) deleteMonthlySalary(deleteSalaryId);
                setDeleteSalaryId(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SET WALLET BALANCE DRAWER */}
      <Drawer open={!!editingBalCurrency} onOpenChange={(open) => !open && setEditingBalCurrency(null)}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" /> Update {editingBalCurrency} Balance
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setEditingBalCurrency(null)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {editingBalCurrency && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsed = parseFloat(balInput);
                if (!isNaN(parsed) && parsed >= 0) {
                  updateWalletBalance(editingBalCurrency, parsed);
                }
                setEditingBalCurrency(null);
              }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-700">
                <span className="text-3xl">{CURRENCIES[editingBalCurrency].flag}</span>
                <div>
                  <p className="text-xs font-bold text-gray-400">{CURRENCIES[editingBalCurrency].name}</p>
                  <p className="text-sm font-black">{editingBalCurrency}</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  New Balance Amount
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={balInput}
                  onChange={(e) => setBalInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-sm font-black border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs flex items-center justify-center gap-2 mt-2"
              >
                <Check className="w-4 h-4" /> Save Balance
              </button>
            </form>
          )}
        </DrawerContent>
      </Drawer>

      {/* DISABLE SALARY CONFIRMATION & REMARK DIALOG */}
      <AlertDialog open={!!disableTargetSalary} onOpenChange={() => setDisableTargetSalary(null)}>
        <AlertDialogContent className="z-[90] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm mx-auto text-gray-900 dark:text-white">
          <AlertDialogHeader className="space-y-2 text-center sm:text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1">
              <Power className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-extrabold text-gray-900 dark:text-white">
              Disable Salary Template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Future 1st of month payouts for &quot;{disableTargetSalary?.title}&quot; will be paused. Your current budget balance remains unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Quick Suggestion Reason Chips & Remark Input */}
          <div className="space-y-2.5 py-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Reason / Remark
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Already Fired / Terminated',
                'Pre-used / Contract Ended',
                'Paused Temporarily',
                'Job Changed',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setDisableReasonInput(reason)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-[10px] font-extrabold border transition-all',
                    disableReasonInput === reason
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100',
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={disableReasonInput}
              onChange={(e) => setDisableReasonInput(e.target.value)}
              placeholder="e.g. already fired / pre-used..."
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
            />
          </div>

          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 mt-2">
            <AlertDialogCancel
              onClick={() => setDisableTargetSalary(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 font-bold text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (disableTargetSalary) {
                  toggleMonthlySalary(disableTargetSalary.id, disableReasonInput.trim() || 'Disabled');
                }
                setDisableTargetSalary(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20"
            >
              Confirm Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sidebar Drawer */}
      <BudgetSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectSection={(section) => {
          if (section === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (section === 'salary') {
            const el = document.getElementById('section-salary');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (section === 'expenses') {
            const el = document.getElementById('section-expenses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}
