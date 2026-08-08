'use client';

import React, { useState } from 'react';
import {
  Plus,
  Users,
  Trash2,
  Pencil,
  X,
  Check,
  Heart,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Download,
} from 'lucide-react';
import {
  useBudgetStore,
  CurrencyCode,
  formatCurrency,
  FamilyTransaction,
} from '@/store/use-budget-store';
import { MoneyInput } from '@/components/ui/money-input';
import { ExportTableModal } from '../../_components/export-table-modal';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRESET_RELATIONS = ['Mom', 'Dad', 'Sister', 'Brother', 'Wife', 'Husband'];

export default function FamilyBudgetPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<FamilyTransaction | null>(null);

  // Form State
  const [txType, setTxType] = useState<'received' | 'given'>('received');
  const [person, setPerson] = useState<string>('Mom');
  const [customPerson, setCustomPerson] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [addToCurrentBudget, setAddToCurrentBudget] = useState<boolean>(true);

  // Filter State
  const [filterPerson, setFilterPerson] = useState<string>('ALL');

  const {
    familyTransactions = [],
    addFamilyTransaction,
    updateFamilyTransaction,
    deleteFamilyTransaction,
  } = useBudgetStore();

  const handleOpenCreateDrawer = () => {
    setEditingTx(null);
    setTxType('received');
    setPerson('Mom');
    setCustomPerson('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setAddToCurrentBudget(true);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (tx: FamilyTransaction) => {
    setEditingTx(tx);
    setTxType(tx.type);
    if (PRESET_RELATIONS.includes(tx.person)) {
      setPerson(tx.person);
      setCustomPerson('');
    } else {
      setPerson('Mom');
      setCustomPerson(tx.person);
    }
    setAmount(tx.amount.toString());
    setDate(tx.date);
    setNote(tx.note || '');
    setAddToCurrentBudget(tx.addToCurrentBudget !== false);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const finalPerson = customPerson.trim() || person;

    if (editingTx) {
      updateFamilyTransaction(editingTx.id, {
        type: txType,
        person: finalPerson,
        amount: numericAmount,
        currency: 'MMK',
        date,
        note: note.trim() || undefined,
        addToCurrentBudget,
      });
    } else {
      addFamilyTransaction({
        type: txType,
        person: finalPerson,
        amount: numericAmount,
        currency: 'MMK',
        date,
        note: note.trim() || undefined,
        addToCurrentBudget,
      });
    }

    setEditingTx(null);
    setAmount('');
    setNote('');
    setCustomPerson('');
    setIsDrawerOpen(false);
  };

  // Filtered transactions
  const filteredTxs = familyTransactions
    .filter((tx) => filterPerson === 'ALL' || tx.person === filterPerson)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate Net Holding Summary in MMK per Person
  const personSummary: Record<string, number> = {};

  familyTransactions.forEach((tx) => {
    if (personSummary[tx.person] === undefined) {
      personSummary[tx.person] = 0;
    }
    if (tx.type === 'received') {
      personSummary[tx.person] += tx.amount;
    } else {
      personSummary[tx.person] -= tx.amount;
    }
  });

  const totalReceived = filteredTxs
    .filter((t) => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGivenBack = filteredTxs
    .filter((t) => t.type === 'given')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFamilyTotal = totalReceived - totalGivenBack;

  const allPeopleList = Array.from(
    new Set([
      ...Object.keys(personSummary),
      ...familyTransactions.map((t) => t.person),
    ]),
  );

  return (
    <div className="space-y-5">
      {/* HERO BALANCE CARD (MATCHING DESIGN SYSTEM HEADER CARD) */}
      <div className="bg-white dark:bg-black text-slate-950 dark:text-white rounded-[32px] p-6 shadow-xl border border-gray-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
              Family Money Transfers (MMK)
            </span>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateDrawer}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Record Money
          </button>
        </div>

        {/* Person Selector Dropdown Pill (Matching Currency Select Box Design) */}
        <div className="flex justify-center pt-1 pb-1">
          <Select
            value={filterPerson}
            onValueChange={(val) => setFilterPerson(val)}
          >
            <SelectTrigger className="h-9 w-auto px-4 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-slate-950 dark:text-white rounded-full text-sm font-semibold gap-1.5 focus:ring-0 focus:outline-none cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl z-[100]">
              <SelectItem value="ALL" className="text-sm font-semibold py-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800">
                👥 All Family Members
              </SelectItem>
              {allPeopleList.map((pName) => (
                <SelectItem key={pName} value={pName} className="text-sm font-semibold py-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800">
                  👤 {pName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3 SUMMARY TILES: TOTAL RECEIVED, TOTAL BACK, NET TOTAL */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800 text-center">
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800 space-y-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Total Received
            </p>
            <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
              +{formatCurrency(totalReceived, 'MMK')}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800 space-y-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Total Back
            </p>
            <p className="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 tabular-nums whitespace-nowrap">
              -{formatCurrency(totalGivenBack, 'MMK')}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800 space-y-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Net Total
            </p>
            <p
              className={cn(
                'text-xs sm:text-sm font-black tabular-nums whitespace-nowrap',
                netFamilyTotal > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : netFamilyTotal < 0
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-slate-950 dark:text-white',
              )}
            >
              {netFamilyTotal > 0 ? '+' : ''}
              {formatCurrency(netFamilyTotal, 'MMK')}
            </p>
          </div>
        </div>
      </div>



      {/* SECTION 2: FAMILY TRANSACTIONS HISTORY TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Family Transfer Activity
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-black flex items-center gap-1.5 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Statement
          </button>
        </div>

        {filteredTxs.length > 0 ? (
          <div className="space-y-2.5">
            {filteredTxs.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl space-y-2 border border-gray-100 dark:border-zinc-700/60"
              >
                {/* Top Row: Icon + Title + Pill (Left) & Amount (Right) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-sm',
                        tx.type === 'received' ? 'bg-emerald-500' : 'bg-rose-500',
                      )}
                    >
                      {tx.type === 'received' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                          {tx.type === 'received'
                            ? `Received from ${tx.person}`
                            : `Given back to ${tx.person}`}
                        </p>
                        <span
                          className={cn(
                            'text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0',
                            tx.type === 'received'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
                          )}
                        >
                          {tx.type === 'received' ? 'Received' : 'Given'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'font-black text-sm tabular-nums shrink-0',
                      tx.type === 'received'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {tx.type === 'received' ? '+' : '-'}
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                </div>

                {/* Bottom Row: Date + Note (Left) & Edit/Delete Actions (Right) */}
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/50 dark:border-zinc-700/40 text-[10px] font-bold text-gray-400">
                  <span className="truncate">
                    {tx.date} {tx.note ? `• ${tx.note}` : ''}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDrawer(tx)}
                      className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Edit Record"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTxId(tx.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-6">
            No family records found.
          </p>
        )}
      </div>

      {/* LOG / EDIT FAMILY TRANSFER DRAWER */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] h-auto overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              {editingTx ? 'Edit Family Money Record' : 'Log Family Money Transfer'}
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
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setTxType('received')}
                className={cn(
                  'py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all',
                  txType === 'received'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                )}
              >
                <ArrowDownLeft className="w-4 h-4" /> Received (Income)
              </button>

              <button
                type="button"
                onClick={() => setTxType('given')}
                className={cn(
                  'py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all',
                  txType === 'given'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                )}
              >
                <ArrowUpRight className="w-4 h-4" /> Given Back (Expense)
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Family Member
              </label>

              <div className="flex flex-wrap gap-1.5">
                {PRESET_RELATIONS.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => {
                      setPerson(rel);
                      setCustomPerson('');
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all',
                      person === rel && !customPerson
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100',
                    )}
                  >
                    {rel}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={customPerson}
                onChange={(e) => setCustomPerson(e.target.value)}
                placeholder="Or type custom name (e.g. Uncle John)..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Amount (MMK)
              </label>
              <div className="relative">
                <MoneyInput
                  value={amount}
                  setValue={setAmount}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500 pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gray-200 dark:bg-zinc-700 text-[10px] font-black rounded-xl text-gray-700 dark:text-gray-200">
                  🇲🇲 MMK
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Date
              </label>
              <DatePicker value={date} onChange={setDate} />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700">
              <div className="space-y-0.5">
                <label
                  htmlFor="add-budget-switch"
                  className="text-xs font-black text-gray-900 dark:text-white block cursor-pointer"
                >
                  Add to Current Budget
                </label>
                <p className="text-[10px] text-gray-400 font-bold">
                  {addToCurrentBudget
                    ? 'Credits/deducts MMK wallet balance'
                    : 'Tracks family balance only (wallet unchanged)'}
                </p>
              </div>
              <Switch
                id="add-budget-switch"
                checked={addToCurrentBudget}
                onCheckedChange={setAddToCurrentBudget}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Note / Remark (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. For monthly groceries, emergency money..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <button
              type="submit"
              className={cn(
                'w-full py-3.5 text-white font-extrabold rounded-2xl shadow-lg transition-all text-xs flex items-center justify-center gap-2 mt-2',
                txType === 'received'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25',
              )}
            >
              <Check className="w-4 h-4" />{' '}
              {editingTx
                ? 'Save Changes'
                : txType === 'received'
                ? 'Save Received Money'
                : 'Save Given Money'}
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <AlertDialogContent className="z-[90] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-xs mx-auto text-gray-900 dark:text-white">
          <AlertDialogHeader className="space-y-2 text-center sm:text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-1">
              <Trash2 className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-extrabold text-gray-900 dark:text-white">
              Delete Family Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Deleting this record will automatically revert the change from your budget wallet
              balance.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setDeleteTxId(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 font-bold text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTxId) deleteFamilyTransaction(deleteTxId);
                setDeleteTxId(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Table Image Modal */}
      <ExportTableModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Family Money Transfer Statement"
        subtitle="Shared Family & Household Funds (MMK)"
        rows={familyTransactions.map((t) => ({
          date: t.date,
          from: t.person,
          categoryOrType: t.type === 'received' ? 'Received from Family' : 'Given to Family',
          amount: t.amount,
          currency: 'MMK',
          isPositive: t.type === 'received',
        }))}
      />
    </div>
  );
}
