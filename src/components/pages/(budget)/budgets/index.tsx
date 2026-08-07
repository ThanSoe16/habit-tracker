'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  HandCoins,
  Trash2,
  X,
  Check,
  ArrowUpRight,
  BarChart2,
  PieChart,
  Activity,
  Pencil,
  Coins,
  Music,
  Tv,
  MessageSquare,
  ShoppingBag,
  Car,
  Utensils,
  Zap,
} from 'lucide-react';
import {
  useBudgetStore,
  BUDGET_CATEGORIES,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  BudgetEntry,
} from '@/store/use-budget-store';
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
import { toast } from 'sonner';

export default function BudgetMainPage() {
  const router = useRouter();

  // Active Currency Selection State for Hero Balance
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USDT');

  // Drawers & Dialogs State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);

  // Edit / Delete State
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteTargetExpense, setDeleteTargetExpense] = useState<{ id: string; name: string } | null>(null);

  // Form State: Add/Edit Expense
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<string>(BUDGET_CATEGORIES[0]?.name || 'Food & Groceries');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCurrency, setExpenseCurrency] = useState<CurrencyCode>('USDT');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseNote, setExpenseNote] = useState('');

  // Form State: Direct Wallet Balance Addition
  const [balanceAddAmount, setBalanceAddAmount] = useState('');
  const [balanceAddCurrency, setBalanceAddCurrency] = useState<CurrencyCode>('USDT');

  const {
    walletBalances,
    budgetEntries = [],
    addExpense,
    deleteBudgetEntry,
    updateWalletBalance,
  } = useBudgetStore();

  const currentBalance = walletBalances[selectedCurrency] || 0;
  const expenses = budgetEntries.filter((e) => e.type === 'expense');

  // Reset Add Expense Form
  const resetExpenseForm = () => {
    setEditingExpenseId(null);
    setExpenseTitle('');
    setExpenseCategory(BUDGET_CATEGORIES[0]?.name || 'Food & Groceries');
    setExpenseAmount('');
    setExpenseCurrency(selectedCurrency);
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setExpenseNote('');
  };

  // Open Edit Expense
  const handleOpenEditExpense = (exp: BudgetEntry) => {
    setEditingExpenseId(exp.id);
    setExpenseTitle(exp.title);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount.toString());
    setExpenseCurrency(exp.currency);
    setExpenseDate(exp.date);
    setExpenseNote(exp.note || '');
    setIsAddExpenseOpen(true);
  };

  // Submit Expense Form (Add or Update)
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(expenseAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    if (editingExpenseId) {
      deleteBudgetEntry(editingExpenseId);
    }
    addExpense({
      title: expenseTitle.trim() || expenseCategory,
      category: expenseCategory,
      amount: numericAmount,
      currency: expenseCurrency,
      date: expenseDate,
      note: expenseNote.trim() || undefined,
    });

    setIsAddExpenseOpen(false);
    resetExpenseForm();
    toast.success(editingExpenseId ? 'Expense updated successfully' : 'Expense recorded successfully');
  };

  // Submit Direct Balance Addition
  const handleBalanceAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(balanceAddAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const currentBal = walletBalances[balanceAddCurrency] || 0;
    updateWalletBalance(balanceAddCurrency, currentBal + numericAmount);
    setBalanceAddAmount('');
    setIsAddBalanceOpen(false);
    toast.success(`Successfully deposited ${formatCurrency(numericAmount, balanceAddCurrency)}`);
  };

  // Sort expenses descending by date
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const recentExpenses = sortedExpenses.slice(0, 10);

  // Helper to render icon for expense item
  const getExpenseIcon = (catName: string, title: string) => {
    const lowerTitle = (title + ' ' + catName).toLowerCase();
    if (lowerTitle.includes('spotify') || lowerTitle.includes('music')) {
      return (
        <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Music className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (lowerTitle.includes('netflix') || lowerTitle.includes('movie') || lowerTitle.includes('tv')) {
      return (
        <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-lg shrink-0">
          <Tv className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (lowerTitle.includes('slack') || lowerTitle.includes('chat') || lowerTitle.includes('app')) {
      return (
        <div className="w-11 h-11 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0">
          <MessageSquare className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (lowerTitle.includes('food') || lowerTitle.includes('din') || lowerTitle.includes('cafe')) {
      return (
        <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
          <Utensils className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (lowerTitle.includes('shop') || lowerTitle.includes('store') || lowerTitle.includes('buy')) {
      return (
        <div className="w-11 h-11 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (lowerTitle.includes('taxi') || lowerTitle.includes('car') || lowerTitle.includes('transport')) {
      return (
        <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
          <Car className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (lowerTitle.includes('bill') || lowerTitle.includes('electric') || lowerTitle.includes('power')) {
      return (
        <div className="w-11 h-11 rounded-full bg-yellow-500 text-white flex items-center justify-center shrink-0">
          <Zap className="w-5.5 h-5.5" />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
        <TrendingDown className="w-5.5 h-5.5" />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. HERO BALANCE CARD (WHITE IN LIGHT MODE, BLACK IN DARK MODE) */}
      <div className="bg-white dark:bg-black text-slate-950 dark:text-white rounded-[32px] p-6 shadow-xl border border-gray-200/80 dark:border-zinc-800 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Current Balance</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white tabular-nums">
            {formatCurrency(currentBalance, selectedCurrency)}
          </h1>

          {/* Currency Dropdown Selector Pill */}
          <div className="flex justify-center pt-1">
            <Select
              value={selectedCurrency}
              onValueChange={(val) => setSelectedCurrency(val as CurrencyCode)}
            >
              <SelectTrigger className="h-8 w-auto px-3 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-slate-950 dark:text-white rounded-full text-xs font-bold gap-1 focus:ring-0 focus:outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl z-[100]">
                {Object.values(CURRENCIES).map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs font-bold hover:bg-gray-100 dark:hover:bg-zinc-800">
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="border-t border-gray-100 dark:border-zinc-800" />

        {/* 4 ACTION BUTTONS ROW */}
        <div className="grid grid-cols-4 gap-3 text-center">
          {/* Family budget */}
          <button
            type="button"
            onClick={() => router.push('/budget/family')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200/80 dark:border-zinc-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <Users className="w-6 h-6 stroke-[2.5] text-slate-950 dark:text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
              Family budget
            </span>
          </button>

          {/* Income */}
          <button
            type="button"
            onClick={() => router.push('/budget/income')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200/80 dark:border-zinc-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <TrendingUp className="w-6 h-6 stroke-[2.5] text-slate-950 dark:text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
              Income
            </span>
          </button>

          {/* Expenses */}
          <button
            type="button"
            onClick={() => router.push('/budget/expenses')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200/80 dark:border-zinc-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <TrendingDown className="w-6 h-6 stroke-[2.5] text-slate-950 dark:text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
              Expenses
            </span>
          </button>

          {/* Loan & Borrow */}
          <button
            type="button"
            onClick={() => router.push('/budget/loans')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200/80 dark:border-zinc-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <HandCoins className="w-6 h-6 stroke-[2.5] text-slate-950 dark:text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
              Loan & Borrow
            </span>
          </button>
        </div>
      </div>

      {/* 2. RECENT TRANSACTION CARD (WHITE IN LIGHT MODE, BLACK IN DARK MODE) */}
      <div className="bg-white dark:bg-black rounded-[32px] p-6 shadow-sm border border-gray-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            Recent Transaction
          </h2>

          <button
            type="button"
            onClick={() => router.push('/budget/expenses')}
            className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/90 border border-gray-100 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {getExpenseIcon(exp.category, exp.title)}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                      {exp.title || exp.category}
                    </h3>
                    <p className="text-[10px] font-medium text-gray-400 dark:text-gray-400 mt-0.5">
                      {exp.date} {exp.note ? `• ${exp.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-xs text-gray-900 dark:text-white tabular-nums">
                    -{formatCurrency(exp.amount, exp.currency)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenEditExpense(exp)}
                    className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-colors shadow-xs"
                    title="Edit Expense"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetExpense({ id: exp.id, name: exp.title || exp.category })}
                    className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-300 hover:text-red-500 flex items-center justify-center transition-colors shadow-xs"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-6">
            No transactions logged yet. Tap &quot;Payment&quot; above to add a transaction!
          </p>
        )}
      </div>

      {/* DRAWER: ADD / EDIT EXPENSE (PAYMENT) */}
      <Drawer open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {editingExpenseId ? 'Edit Payment / Expense' : 'New Payment / Expense'}
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Expense / Service Title
              </label>
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. Spotify Premium, Netflix, Coffee..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <Select value={expenseCategory} onValueChange={(val) => setExpenseCategory(val)}>
                <SelectTrigger className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Amount
                </label>
                <MoneyInput
                  value={expenseAmount}
                  setValue={setExpenseAmount}
                  placeholder="0.00"
                  preFix={CURRENCIES[expenseCurrency]?.symbol}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Currency
                </label>
                <Select
                  value={expenseCurrency}
                  onValueChange={(val) => setExpenseCurrency(val as CurrencyCode)}
                >
                  <SelectTrigger className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCIES).map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Date
              </label>
              <DatePicker value={expenseDate} onChange={setExpenseDate} />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Note / Remark (Optional)
              </label>
              <input
                type="text"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                placeholder="e.g. Monthly subscription..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4" /> {editingExpenseId ? 'Save Changes' : 'Confirm Payment'}
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* DRAWER: DIRECT BALANCE TOP-UP */}
      <Drawer open={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Top-up Wallet Balance
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsAddBalanceOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleBalanceAddSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Top-up Amount
                </label>
                <MoneyInput
                  value={balanceAddAmount}
                  setValue={setBalanceAddAmount}
                  placeholder="0.00"
                  preFix={CURRENCIES[balanceAddCurrency]?.symbol}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Target Currency
                </label>
                <Select
                  value={balanceAddCurrency}
                  onValueChange={(val) => setBalanceAddCurrency(val as CurrencyCode)}
                >
                  <SelectTrigger className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCIES).map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4" /> Confirm Top-up
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* DELETE CONFIRMATION DIALOG: EXPENSE */}
      <AlertDialog open={!!deleteTargetExpense} onOpenChange={() => setDeleteTargetExpense(null)}>
        <AlertDialogContent className="z-[90] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-xs mx-auto text-gray-900 dark:text-white">
          <AlertDialogHeader className="space-y-2 text-center sm:text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-1">
              <Trash2 className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-extrabold text-gray-900 dark:text-white">
              Delete Transaction?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this transaction (&ldquo;{deleteTargetExpense?.name}&rdquo;)?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setDeleteTargetExpense(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 font-bold text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTargetExpense) deleteBudgetEntry(deleteTargetExpense.id);
                setDeleteTargetExpense(null);
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
