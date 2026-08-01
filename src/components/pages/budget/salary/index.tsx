'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Calendar as CalendarIcon,
  Pencil,
  Power,
  Trash2,
  X,
  Check,
  Sparkles,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useBudgetStore,
  BUDGET_CATEGORIES,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  MonthlySalary,
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

export default function SalaryPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSalaryDrawerOpen, setIsSalaryDrawerOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<MonthlySalary | null>(null);
  const [deleteSalaryId, setDeleteSalaryId] = useState<string | null>(null);
  const [disableTargetSalary, setDisableTargetSalary] = useState<MonthlySalary | null>(null);
  const [disableReasonInput, setDisableReasonInput] = useState<string>('');

  const {
    monthlySalaries,
    addMonthlySalary,
    updateMonthlySalary,
    toggleMonthlySalary,
    deleteMonthlySalary,
    processMonthlySalaryPayout,
  } = useBudgetStore();

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

  const getCategoryEmoji = (catName: string) => {
    const found = BUDGET_CATEGORIES.find((c) => c.name === catName);
    return found ? found.icon : '💼';
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
            Monthly Salary Table
          </h1>

          <button
            type="button"
            onClick={openAddSalary}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-500/30 transition-transform active:scale-95"
            title="Add Salary Template"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {/* 1st Payout Banner Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-purple-600/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
              Automated Payouts
            </p>
            <h2 className="text-base font-black tracking-tight mt-0.5">
              Every 1st Day of Month
            </h2>
            <p className="text-xs text-purple-100/90 font-medium mt-1">
              Active salary entries automatically credit your Current Budget table.
            </p>
          </div>

          <button
            type="button"
            onClick={processMonthlySalaryPayout}
            className="px-3.5 py-2 rounded-2xl bg-white text-purple-700 text-xs font-black shrink-0 hover:bg-purple-50 shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-600" /> Payout Now
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 p-3.5 rounded-2xl text-xs text-purple-900 dark:text-purple-200 font-medium flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <span>
            Editing or disabling a salary template will <strong>not affect</strong> funds already credited to your Current Budget.
          </span>
        </div>

        {/* Salary Items Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Configured Salaries ({monthlySalaries.length})
            </h2>
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
              {monthlySalaries.filter((s) => s.isEnabled).length} Active
            </span>
          </div>

          {monthlySalaries.length > 0 ? (
            <div className="space-y-2.5">
              {monthlySalaries.map((sal) => (
                <div
                  key={sal.id}
                  className={cn(
                    'p-4 rounded-2xl border space-y-3 transition-all',
                    sal.isEnabled
                      ? 'bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700'
                      : 'bg-gray-50/40 dark:bg-zinc-800/30 border-gray-100 dark:border-zinc-800/60 opacity-60',
                  )}
                >
                  {/* Top Row: Icon, Title, Category, Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-lg shrink-0 border border-purple-200/50 dark:border-purple-800/50">
                        {getCategoryEmoji(sal.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="font-black text-sm text-gray-900 dark:text-white leading-snug">
                            {sal.title}
                          </h3>
                          <span
                            className={cn(
                              'text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0',
                              sal.isEnabled
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-400',
                            )}
                          >
                            {sal.isEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                          {sal.category} • Every 1st of Month
                        </p>
                        {!sal.isEnabled && sal.disabledReason && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold mt-0.5">
                            Reason: {sal.disabledReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="font-black text-base text-gray-900 dark:text-white tabular-nums shrink-0">
                      {formatCurrency(sal.amount, sal.currency)}
                    </span>
                  </div>

                  {/* Bottom Action Row: 3 Action Buttons below */}
                  <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-700/60 flex items-center justify-end gap-2">
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
                        'px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors',
                        sal.isEnabled
                          ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                          : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300',
                      )}
                      title={sal.isEnabled ? 'Disable Salary' : 'Enable Salary'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{sal.isEnabled ? 'Active' : 'Enable'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditSalary(sal)}
                      className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-700/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-extrabold flex items-center gap-1 transition-colors"
                      title="Edit Salary"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteSalaryId(sal.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-extrabold flex items-center gap-1 transition-colors"
                      title="Delete Salary Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mx-auto">
                💼
              </div>
              <p className="text-xs text-gray-400 font-bold">
                No salary templates configured yet.
              </p>
              <button
                type="button"
                onClick={openAddSalary}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-purple-500/25"
              >
                + Add Salary Template
              </button>
            </div>
          )}
        </div>
      </div>

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
      />
    </div>
  );
}
