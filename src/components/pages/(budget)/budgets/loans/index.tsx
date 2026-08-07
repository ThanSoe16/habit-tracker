'use client';

import React, { useState } from 'react';
import { Plus, X, HandCoins, Receipt, CheckCircle2 } from 'lucide-react';
import {
  useBudgetStore,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  LoanTransaction,
} from '@/store/use-budget-store';
import { MoneyInput } from '@/components/ui/money-input';
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
import { parseISO, format } from 'date-fns';

export default function LoansPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null);
  const [activeLoanForRepay, setActiveLoanForRepay] = useState<LoanTransaction | null>(null);

  // Form State for New Loan / Borrow
  const [loanType, setLoanType] = useState<'lend' | 'borrow'>('lend');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USDT');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Repayment state
  const [repayAmount, setRepayAmount] = useState('');

  // Filters
  const [filterType, setFilterType] = useState<'ALL' | 'lend' | 'borrow'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'pending' | 'repaid'>('ALL');
  const [filterCurrency, setFilterCurrency] = useState<CurrencyCode | 'ALL'>('ALL');

  const { loans = [], addLoan, deleteLoan, repayLoan } = useBudgetStore();

  const openAddDrawer = (type: 'lend' | 'borrow') => {
    setLoanType(type);
    setPersonName('');
    setAmount('');
    setCurrency('USDT');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setIsDrawerOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!personName.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    addLoan({
      type: loanType,
      personName: personName.trim(),
      amount: numericAmount,
      currency,
      dueDate,
      date,
      note: note.trim() || undefined,
    });

    setIsDrawerOpen(false);
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoanForRepay) return;
    const numericRepay = parseFloat(repayAmount);
    if (isNaN(numericRepay) || numericRepay <= 0) return;

    repayLoan(activeLoanForRepay.id, numericRepay);
    setIsRepayModalOpen(false);
    setActiveLoanForRepay(null);
    setRepayAmount('');
  };

  const filteredLoans = loans
    .filter((l) => {
      if (filterType !== 'ALL' && l.type !== filterType) return false;
      if (filterStatus === 'pending' && l.status === 'repaid') return false;
      if (filterStatus === 'repaid' && l.status !== 'repaid') return false;
      if (filterCurrency !== 'ALL' && l.currency !== filterCurrency) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5">
      {/* Action Buttons: Lend vs Borrow */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => openAddDrawer('lend')}
          className="p-4 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 flex flex-col justify-between h-28 hover:opacity-95 transition-all"
        >
          <div className="flex items-center justify-between w-full">
            <span className="p-2 rounded-2xl bg-white/20">
              <HandCoins className="w-5 h-5" />
            </span>
            <Plus className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold opacity-90 block">I Lent Money</span>
            <span className="text-lg font-black block leading-none mt-0.5">Money Out →</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openAddDrawer('borrow')}
          className="p-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 flex flex-col justify-between h-28 hover:opacity-95 transition-all"
        >
          <div className="flex items-center justify-between w-full">
            <span className="p-2 rounded-2xl bg-white/20">
              <Receipt className="w-5 h-5" />
            </span>
            <Plus className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold opacity-90 block">I Borrowed Money</span>
            <span className="text-lg font-black block leading-none mt-0.5">← Money In</span>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex gap-1">
          {(['ALL', 'lend', 'borrow'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-bold transition-all capitalize',
                filterType === t
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'text-gray-400 hover:text-gray-600',
              )}
            >
              {t === 'ALL'
                ? 'All Types'
                : t === 'lend'
                  ? 'Lent (Money Out)'
                  : 'Borrowed (Money In)'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-gray-100 dark:border-zinc-800 flex gap-1">
            {(['ALL', 'pending', 'repaid'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'flex-1 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all',
                  filterStatus === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-gray-100 dark:border-zinc-800 flex gap-1">
            {(['ALL', 'USDT', 'THB', 'MMK', 'SGD'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterCurrency(c)}
                className={cn(
                  'px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all',
                  filterCurrency === c
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity List */}
      {filteredLoans.length > 0 ? (
        <div className="space-y-3">
          {filteredLoans.map((l) => {
            const remaining = l.amount - (l.repaidAmount || 0);
            const isSettled = l.status === 'repaid' || remaining <= 0;

            return (
              <div
                key={l.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-white',
                        l.type === 'lend'
                          ? 'bg-amber-500 shadow-amber-500/20'
                          : 'bg-blue-600 shadow-blue-600/20',
                      )}
                    >
                      {l.type === 'lend' ? (
                        <HandCoins className="w-5 h-5" />
                      ) : (
                        <Receipt className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {l.personName}
                        </h3>
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                            isSettled
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : l.status === 'partial'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
                          )}
                        >
                          {isSettled ? 'Settled' : l.status === 'partial' ? 'Partial' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                        {l.type === 'lend' ? 'Lent' : 'Borrowed'} on {l.date}
                        {l.dueDate && ` • Due: ${l.dueDate}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={cn(
                        'font-black text-base block',
                        l.type === 'lend'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-blue-600 dark:text-blue-400',
                      )}
                    >
                      {formatCurrency(l.amount, l.currency)}
                    </span>
                    {l.repaidAmount > 0 && !isSettled && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        Repaid: {formatCurrency(l.repaidAmount, l.currency)}
                      </span>
                    )}
                  </div>
                </div>

                {l.note && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-xl italic">
                    {`"${l.note}"`}
                  </p>
                )}

                {!isSettled && (
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLoanForRepay(l);
                        setRepayAmount(String(remaining));
                        setIsRepayModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Repayment</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center space-y-3 border border-gray-100 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto">
            <HandCoins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
              No loan records
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {`Tap "I Lent" or "I Borrowed" to create a record.`}
            </p>
          </div>
        </div>
      )}

      {/* Add / Create Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="z-[70] max-w-lg mx-auto rounded-t-[36px] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
            <DrawerTitle className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              {loanType === 'lend' ? (
                <>
                  <HandCoins className="w-5 h-5 text-amber-500" />
                  <span>Record Money Lent (I Lent)</span>
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span>Record Money Borrowed (I Borrowed)</span>
                </>
              )}
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                {loanType === 'lend'
                  ? 'Borrower Name (Who took money)'
                  : 'Lender Name (Who gave money)'}
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Amount
                </label>
                <MoneyInput value={amount} setValue={setAmount} placeholder="0.00" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Date
                </label>
                <DatePicker
                  date={date ? parseISO(date) : new Date()}
                  onChange={(d) => d && setDate(format(d, 'yyyy-MM-dd'))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Due Date (Optional)
                </label>
                <DatePicker
                  date={dueDate ? parseISO(dueDate) : new Date()}
                  onChange={(d) => d && setDueDate(format(d, 'yyyy-MM-dd'))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                Note / Reason
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Lunch money fallback"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className={cn(
                'w-full py-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all active:scale-98',
                loanType === 'lend'
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-blue-600 hover:bg-blue-700',
              )}
            >
              Save Record & Update Wallet
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Repay Modal */}
      <Drawer open={isRepayModalOpen} onOpenChange={setIsRepayModalOpen}>
        <DrawerContent className="z-[70] max-w-lg mx-auto rounded-t-[36px] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
            <DrawerTitle className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Record Repayment</span>
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsRepayModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {activeLoanForRepay && (
            <form onSubmit={handleRepaySubmit} className="space-y-4">
              <div className="bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700">
                <p className="text-xs font-bold text-gray-500">
                  {activeLoanForRepay.type === 'lend'
                    ? `Repayment from ${activeLoanForRepay.personName}`
                    : `Repaying debt to ${activeLoanForRepay.personName}`}
                </p>
                <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                  Remaining Unsettled:{' '}
                  {formatCurrency(
                    activeLoanForRepay.amount - (activeLoanForRepay.repaidAmount || 0),
                    activeLoanForRepay.currency,
                  )}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Repayment Amount
                </label>
                <MoneyInput value={repayAmount} setValue={setRepayAmount} placeholder="0.00" />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg transition-all active:scale-98"
              >
                Confirm Repayment
              </button>
            </form>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteLoanId} onOpenChange={() => setDeleteLoanId(null)}>
        <AlertDialogContent className="z-[80] rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-extrabold text-gray-900 dark:text-white">
              Delete Loan Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500">
              Deleting this record will restore/revert the unsettled balance on your wallet balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteLoanId) {
                  deleteLoan(deleteLoanId);
                  setDeleteLoanId(null);
                }
              }}
              className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-bold"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
