'use client';

import React, { useState } from 'react';
import {
  Menu,
  Settings,
  Wallet,
  Download,
  Upload,
  RotateCcw,
  Check,
  ShieldAlert,
  Save,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import {
  useBudgetStore,
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

export default function BudgetSettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const {
    walletBalances,
    updateWalletBalance,
    budgetEntries,
    monthlySalaries,
    familyTransactions,
    resetBudgetData,
    importBudgetData,
    currency,
    setCurrency,
  } = useBudgetStore();

  // Local Wallet Balances Form State
  const [usdtBal, setUsdtBal] = useState(walletBalances.USDT.toString());
  const [thbBal, setThbBal] = useState(walletBalances.THB.toString());
  const [mmkBal, setMmkBal] = useState(walletBalances.MMK.toString());

  const handleSaveBalances = (e: React.FormEvent) => {
    e.preventDefault();
    const u = parseFloat(usdtBal) || 0;
    const t = parseFloat(thbBal) || 0;
    const m = parseFloat(mmkBal) || 0;

    updateWalletBalance('USDT', u);
    updateWalletBalance('THB', t);
    updateWalletBalance('MMK', m);

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  // Export JSON file
  const handleExportJSON = () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      walletBalances,
      monthlySalaries,
      budgetEntries,
      familyTransactions,
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed) {
          importBudgetData(parsed);
          if (parsed.walletBalances) {
            setUsdtBal((parsed.walletBalances.USDT || 0).toString());
            setThbBal((parsed.walletBalances.THB || 0).toString());
            setMmkBal((parsed.walletBalances.MMK || 0).toString());
          }
          alert('Budget data imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

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
            Budget Settings
          </h1>

          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
        </header>

        {/* 1. WALLET INITIAL BALANCES ADJUSTMENT */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Adjust Wallet Balances
              </h2>
            </div>

            {savedFeedback && (
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveBalances} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                💵 USDT Wallet Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={usdtBal}
                onChange={(e) => setUsdtBal(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-extrabold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                🇹🇭 THB Wallet Balance (฿)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={thbBal}
                onChange={(e) => setThbBal(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-extrabold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                🇲🇲 MMK Wallet Balance (K)
              </label>
              <input
                type="number"
                step="1"
                required
                value={mmkBal}
                onChange={(e) => setMmkBal(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-extrabold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Wallet Balances
            </button>
          </form>
        </div>

        {/* 2. CURRENCY DISPLAY PREFERENCE */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Default Display Currency
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['USDT', 'THB', 'MMK'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={cn(
                  'p-3 rounded-2xl border text-center transition-all',
                  currency === code
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-black'
                    : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 font-bold',
                )}
              >
                <span className="text-base block">{CURRENCIES[code].flag}</span>
                <span className="text-xs block mt-1">{code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. DATA BACKUP & RESTORE */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Data Management & Backup
            </h2>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 transition-all flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">
                    Export Backup (JSON)
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400">
                    Download full budget transactions & settings file
                  </p>
                </div>
              </div>
            </button>

            <label className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 transition-all flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">
                    Import Backup (JSON)
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400">
                    Restore budget entries from a backup JSON file
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-all flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-rose-700 dark:text-rose-300">
                    Reset All Budget Data
                  </h3>
                  <p className="text-[10px] font-bold text-rose-400">
                    Wipe all records and reset wallet balances to 0
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* RESET CONFIRMATION DIALOG */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="z-[100] max-w-sm rounded-3xl p-6 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" /> Reset All Budget Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500 font-medium">
              This action will delete all logged transactions, salary templates, and reset your wallet balances to zero. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-4">
            <AlertDialogCancel className="flex-1 py-2.5 rounded-xl font-bold text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetBudgetData();
                setUsdtBal('0');
                setThbBal('0');
                setMmkBal('0');
                setIsResetDialogOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20"
            >
              Reset Data
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
