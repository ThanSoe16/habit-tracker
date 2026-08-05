'use client';

import React, { useState } from 'react';
import {
  Menu,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Receipt,
  Filter,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useBudgetStore,
  BUDGET_CATEGORIES,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
} from '@/store/use-budget-store';
import { BudgetSidebarDrawerModal } from '../_components/budget-sidebar-drawer-modal';
import { ExportTableModal } from '../_components/export-table-modal';
import { cn } from '@/utils/cn';
import { subMonths, subYears, format } from 'date-fns';

type PeriodMode = 'all' | 'monthly' | 'yearly';
type ModuleFilter = 'ALL' | 'INCOME' | 'EXPENSES' | 'FAMILY' | 'SALARY';

export default function BudgetReportsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter States
  const [periodMode, setPeriodMode] = useState<PeriodMode>('monthly');
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  const [selectedYearOffset, setSelectedYearOffset] = useState<number>(0);
  const [selectedModule, setSelectedModule] = useState<ModuleFilter>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<'ALL' | CurrencyCode>('ALL');

  const { walletBalances, monthlySalaries, budgetEntries, familyTransactions = [] } =
    useBudgetStore();

  const today = new Date();

  // Period Date keys
  const targetMonthDate = subMonths(today, selectedMonthOffset);
  const targetMonthKey = format(targetMonthDate, 'yyyy-MM'); // e.g. "2026-08"
  const targetMonthLabel = format(targetMonthDate, 'MMMM yyyy');

  const targetYearDate = subYears(today, selectedYearOffset);
  const targetYearKey = format(targetYearDate, 'yyyy'); // e.g. "2026"
  const targetYearLabel = format(targetYearDate, 'yyyy');

  // Filter entries by Date Period
  const filterByPeriod = (dateStr: string) => {
    if (periodMode === 'all') return true;
    if (periodMode === 'monthly') return dateStr.startsWith(targetMonthKey);
    if (periodMode === 'yearly') return dateStr.startsWith(targetYearKey);
    return true;
  };

  // 1. Process Expense Entries
  const periodExpenses = budgetEntries
    .filter((e) => e.type === 'expense')
    .filter((e) => filterByPeriod(e.date))
    .filter((e) => selectedCurrency === 'ALL' || e.currency === selectedCurrency);

  // 2. Process Extra Income Entries (Excluding Salary & Family)
  const periodExtraIncome = budgetEntries
    .filter((e) => e.type === 'income' && e.category !== 'Salary' && e.category !== 'Family')
    .filter((e) => filterByPeriod(e.date))
    .filter((e) => selectedCurrency === 'ALL' || e.currency === selectedCurrency);

  // 3. Process Salary Payout Entries
  const periodSalaryPayouts = budgetEntries
    .filter((e) => e.type === 'income' && e.category === 'Salary')
    .filter((e) => filterByPeriod(e.date))
    .filter((e) => selectedCurrency === 'ALL' || e.currency === selectedCurrency);

  // 4. Process Family Transactions
  const periodFamilyTxs = familyTransactions
    .filter((t) => filterByPeriod(t.date))
    .filter((t) => selectedCurrency === 'ALL' || t.currency === selectedCurrency);

  // Summary Totals Calculation per Currency
  const currencySummary: Record<CurrencyCode, { inflow: number; outflow: number; net: number }> = {
    USDT: { inflow: 0, outflow: 0, net: 0 },
    THB: { inflow: 0, outflow: 0, net: 0 },
    MMK: { inflow: 0, outflow: 0, net: 0 },
    SGD: { inflow: 0, outflow: 0, net: 0 },
  };

  if (selectedModule === 'ALL' || selectedModule === 'INCOME') {
    periodExtraIncome.forEach((e) => {
      currencySummary[e.currency].inflow += e.amount;
    });
  }
  if (selectedModule === 'ALL' || selectedModule === 'SALARY') {
    periodSalaryPayouts.forEach((e) => {
      currencySummary[e.currency].inflow += e.amount;
    });
  }
  if (selectedModule === 'ALL' || selectedModule === 'FAMILY') {
    periodFamilyTxs
      .filter((t) => t.type === 'received')
      .forEach((t) => {
        currencySummary[t.currency].inflow += t.amount;
      });
  }

  if (selectedModule === 'ALL' || selectedModule === 'EXPENSES') {
    periodExpenses.forEach((e) => {
      currencySummary[e.currency].outflow += e.amount;
    });
  }
  if (selectedModule === 'ALL' || selectedModule === 'FAMILY') {
    periodFamilyTxs
      .filter((t) => t.type === 'given')
      .forEach((t) => {
        currencySummary[t.currency].outflow += t.amount;
      });
  }

  (Object.keys(currencySummary) as CurrencyCode[]).forEach((code) => {
    currencySummary[code].net = currencySummary[code].inflow - currencySummary[code].outflow;
  });

  // Build History Log items list based on selectedModule
  interface UnifiedLogItem {
    id: string;
    module: 'Income' | 'Expense' | 'Family' | 'Salary';
    title: string;
    category: string;
    date: string;
    amount: number;
    currency: CurrencyCode;
    isPositive: boolean;
    note?: string;
  }

  const historyItems: UnifiedLogItem[] = [];

  if (selectedModule === 'ALL' || selectedModule === 'EXPENSES') {
    periodExpenses.forEach((e) => {
      historyItems.push({
        id: e.id,
        module: 'Expense',
        title: e.title,
        category: e.category,
        date: e.date,
        amount: e.amount,
        currency: e.currency,
        isPositive: false,
        note: e.note,
      });
    });
  }

  if (selectedModule === 'ALL' || selectedModule === 'INCOME') {
    periodExtraIncome.forEach((e) => {
      historyItems.push({
        id: e.id,
        module: 'Income',
        title: e.title,
        category: e.category,
        date: e.date,
        amount: e.amount,
        currency: e.currency,
        isPositive: true,
        note: e.note,
      });
    });
  }

  if (selectedModule === 'ALL' || selectedModule === 'SALARY') {
    periodSalaryPayouts.forEach((e) => {
      historyItems.push({
        id: e.id,
        module: 'Salary',
        title: e.title,
        category: 'Salary',
        date: e.date,
        amount: e.amount,
        currency: e.currency,
        isPositive: true,
        note: e.note,
      });
    });
  }

  if (selectedModule === 'ALL' || selectedModule === 'FAMILY') {
    periodFamilyTxs.forEach((t) => {
      historyItems.push({
        id: t.id,
        module: 'Family',
        title: t.type === 'received' ? `Received from ${t.person}` : `Given to ${t.person}`,
        category: 'Family',
        date: t.date,
        amount: t.amount,
        currency: t.currency,
        isPositive: t.type === 'received',
        note: t.note,
      });
    });
  }

  // Sort history by date descending
  historyItems.sort((a, b) => b.date.localeCompare(a.date));

  // Category Breakdown Calculation for Period
  const categoryTotals: Record<string, number> = {};
  periodExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const totalExpenseVal = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryBreakdown = Object.keys(categoryTotals)
    .map((catName) => {
      const amount = categoryTotals[catName];
      const percent = totalExpenseVal > 0 ? Math.round((amount / totalExpenseVal) * 100) : 0;
      const categoryInfo = BUDGET_CATEGORIES.find((c) => c.name === catName);
      return {
        name: catName,
        icon: categoryInfo ? categoryInfo.icon : '📦',
        amount,
        percent,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white pb-32">
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
            Advanced Financial Reports
          </h1>

          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </header>

        {/* 1. PERIOD MODE SELECTOR (ALL / MONTHLY / YEARLY) */}
        <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs grid grid-cols-3 gap-1">
          {(['monthly', 'yearly', 'all'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPeriodMode(mode)}
              className={cn(
                'py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                periodMode === mode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-white',
              )}
            >
              {mode === 'monthly' ? 'Monthly' : mode === 'yearly' ? 'Yearly' : 'All Time'}
            </button>
          ))}
        </div>

        {/* 2. DATE NAVIGATION BAR (MONTH / YEAR SELECTOR) */}
        {periodMode !== 'all' && (
          <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (periodMode === 'monthly') setSelectedMonthOffset((prev) => prev + 1);
                if (periodMode === 'yearly') setSelectedYearOffset((prev) => prev + 1);
              }}
              className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
              title="Previous Period"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {periodMode === 'monthly' ? 'Selected Month' : 'Selected Year'}
              </p>
              <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center justify-center gap-1.5 mt-0.5">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />{' '}
                {periodMode === 'monthly' ? targetMonthLabel : targetYearLabel}
              </h2>
            </div>

            <button
              type="button"
              disabled={
                periodMode === 'monthly' ? selectedMonthOffset <= 0 : selectedYearOffset <= 0
              }
              onClick={() => {
                if (periodMode === 'monthly')
                  setSelectedMonthOffset((prev) => Math.max(0, prev - 1));
                if (periodMode === 'yearly')
                  setSelectedYearOffset((prev) => Math.max(0, prev - 1));
              }}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                (periodMode === 'monthly' ? selectedMonthOffset > 0 : selectedYearOffset > 0)
                  ? 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                  : 'bg-gray-50/50 dark:bg-zinc-800/40 text-gray-300 dark:text-zinc-700 cursor-not-allowed',
              )}
              title="Next Period"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 3. MODULE CATEGORY FILTER TABS */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 px-1">
            Module Category
          </p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {(
              [
                { id: 'ALL', label: 'All Modules', icon: Filter },
                { id: 'INCOME', label: 'Income', icon: TrendingUp },
                { id: 'EXPENSES', label: 'Expenses', icon: TrendingDown },
                { id: 'FAMILY', label: 'Family', icon: Users },
                { id: 'SALARY', label: 'Salary', icon: Building2 },
              ] as const
            ).map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModule(mod.id)}
                  className={cn(
                    'px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all border',
                    selectedModule === mod.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. CURRENCY SELECTOR TABS */}
        <div className="flex gap-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
          {(['ALL', 'USDT', 'THB', 'MMK'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedCurrency(code)}
              className={cn(
                'flex-1 py-1.5 rounded-xl text-xs font-black transition-all',
                selectedCurrency === code
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-white',
              )}
            >
              {code}
            </button>
          ))}
        </div>

        {/* 5. HERO SUMMARY CARDS (3 SEPARATE CURRENCY TOTALS) */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-800 text-white rounded-3xl p-6 shadow-xl shadow-emerald-600/20 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Period Analytics ({periodMode.toUpperCase()})
              </p>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                Financial Summary
              </h2>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-black rounded-full border border-white/20">
              {selectedCurrency === 'ALL' ? '3 Currencies' : selectedCurrency}
            </span>
          </div>

          {/* 3 Separate Currency Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            {((selectedCurrency === 'ALL'
              ? ['USDT', 'THB', 'MMK']
              : [selectedCurrency]) as CurrencyCode[]).map((code) => {
              const cData = currencySummary[code];
              return (
                <div
                  key={code}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 space-y-1.5 text-center"
                >
                  <span className="text-[10px] font-black text-emerald-200 uppercase block">
                    {CURRENCIES[code].flag} {code}
                  </span>

                  <div className="space-y-0.5 text-[10px]">
                    <p className="text-emerald-200 font-bold truncate">
                      In: +{formatCurrency(cData.inflow, code)}
                    </p>
                    <p className="text-rose-200 font-bold truncate">
                      Out: -{formatCurrency(cData.outflow, code)}
                    </p>
                  </div>

                  <div className="pt-1 border-t border-white/15">
                    <p className="text-[9px] font-black text-white uppercase">Net Balance</p>
                    <p
                      className={cn(
                        'text-xs font-black truncate tabular-nums',
                        cData.net > 0
                          ? 'text-emerald-300'
                          : cData.net < 0
                          ? 'text-rose-300'
                          : 'text-white',
                      )}
                    >
                      {cData.net > 0 ? '+' : ''}
                      {formatCurrency(cData.net, code)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. CATEGORY EXPENSE SHARE BREAKDOWN */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <PieChart className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Category Spending Breakdown
              </h2>
            </div>
          </div>

          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                    <div className="font-black text-right tabular-nums">
                      <span>
                        {selectedCurrency !== 'ALL'
                          ? formatCurrency(cat.amount, selectedCurrency)
                          : `$${cat.amount.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1 font-bold">({cat.percent}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, cat.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-bold text-center py-6">
              No expense records logged for this period.
            </p>
          )}
        </div>

        {/* 7. DETAILED HISTORY LOG & ACTIVITY LIST */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Receipt className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white truncate">
                Detailed History Log ({historyItems.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-black flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Image
              </button>
              <span className="text-xs font-black text-gray-400 uppercase">
                {selectedModule}
              </span>
            </div>
          </div>

          {historyItems.length > 0 ? (
            <div className="space-y-2.5">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug">
                        {item.title}
                      </p>
                      <span
                        className={cn(
                          'text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0',
                          item.module === 'Income' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                          item.module === 'Salary' && 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
                          item.module === 'Expense' && 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
                          item.module === 'Family' && 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
                        )}
                      >
                        {item.module}
                      </span>
                    </div>

                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {item.category} • {item.date} {item.note ? `• ${item.note}` : ''}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'font-black text-xs tabular-nums shrink-0',
                      item.isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {item.isPositive ? '+' : '-'}
                    {formatCurrency(item.amount, item.currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-bold text-center py-8">
              No transaction history found for the selected period and module filter.
            </p>
          )}
        </div>
      </div>

      {/* SIDEBAR DRAWER */}
      <BudgetSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* EXPORT TABLE IMAGE MODAL */}
      <ExportTableModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Financial Statement Report"
        subtitle={`${periodMode === 'monthly' ? targetMonthLabel : periodMode === 'yearly' ? targetYearLabel : 'All Time'} • ${selectedModule} Filter`}
        rows={historyItems.map((item) => ({
          date: item.date,
          from: item.title,
          categoryOrType: `${item.module} (${item.category})`,
          amount: item.amount,
          currency: item.currency,
          isPositive: item.isPositive,
        }))}
      />
    </div>
  );
}
