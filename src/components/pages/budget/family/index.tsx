'use client';

import React, { useState } from 'react';
import {
  Menu,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  Trash2,
  Pencil,
  X,
  Check,
  Calendar as CalendarIcon,
  Heart,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useBudgetStore,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  FamilyTransaction,
} from '@/store/useBudgetStore';
import { BudgetSidebarDrawerModal } from '../_components/BudgetSidebarDrawerModal';
import { MoneyInput } from '@/components/ui/money-input';
import { ExportTableModal } from '../_components/ExportTableModal';
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
import { Switch } from '@/components/ui/switch';
import { format, parseISO } from 'date-fns';

const PRESET_RELATIONS = ['Mom', 'Dad', 'Sister', 'Brother', 'Wife', 'Husband'];

export default function FamilyBudgetPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<FamilyTransaction | null>(null);

  // Form State
  const [txType, setTxType] = useState<'received' | 'given'>('received');
  const [person, setPerson] = useState<string>('Mom');
  const [customPerson, setCustomPerson] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const currency: CurrencyCode = 'MMK';
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
    walletBalances,
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

    // Reset Form
    setEditingTx(null);
    setAmount('');
    setNote('');
    setCustomPerson('');
    setIsDrawerOpen(false);
  };

  // Filtered transactions (person filter & descending date sort)
  const filteredTxs = familyTransactions
    .filter((tx) => {
      return filterPerson === 'ALL' || tx.person === filterPerson;
    })
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

  // Calculate Family Summary Totals (Received, Given Back, Net Total)
  const totalReceived = familyTransactions
    .filter((t) => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGivenBack = familyTransactions
    .filter((t) => t.type === 'given')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFamilyTotal = totalReceived - totalGivenBack;

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
            Family Budget (MMK)
          </h1>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/25 flex items-center justify-center transition-all"
            title="Log Family Transfer"
          >
            <Plus className="w-6 h-6" />
          </button>
        </header>

        {/* HERO CARD: SHARED FAMILY MONEY OVERVIEW (MMK STRICT) */}
        <div className="bg-gradient-to-br from-pink-600 via-rose-600 to-purple-800 text-white rounded-3xl p-6 shadow-xl shadow-pink-600/20 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-pink-200 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-300" /> Family Money Transfers (MMK)
              </p>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                Household Funds & Mom Transfers
              </h2>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-black rounded-full border border-white/20">
              {familyTransactions.length} Logged
            </span>
          </div>

          <p className="text-xs text-pink-100 font-medium leading-relaxed">
            Record MMK money received from mom/family or returned to them. Summary calculations reflect family transfer records.
          </p>

          {/* 3 Family Summary Cards */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
              <p className="text-[9px] font-black text-pink-200 uppercase tracking-wider">
                Total Received
              </p>
              <p className="text-xs font-black truncate mt-0.5 text-emerald-300 tabular-nums">
                +{formatCurrency(totalReceived, 'MMK')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
              <p className="text-[9px] font-black text-pink-200 uppercase tracking-wider">
                Total Back
              </p>
              <p className="text-xs font-black truncate mt-0.5 text-rose-300 tabular-nums">
                -{formatCurrency(totalGivenBack, 'MMK')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
              <p className="text-[9px] font-black text-pink-200 uppercase tracking-wider">
                Net Total
              </p>
              <p className="text-xs font-black truncate mt-0.5 text-white tabular-nums">
                {netFamilyTotal >= 0 ? '+' : ''}{formatCurrency(netFamilyTotal, 'MMK')}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: PERSON-BY-PERSON NET HOLDING CARDS (MMK) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Net Family Balances in MMK
            </h2>
            <button
              type="button"
              onClick={handleOpenCreateDrawer}
              className="text-xs font-black text-pink-600 dark:text-pink-400 hover:underline"
            >
              + Record Money
            </button>
          </div>

          {Object.keys(personSummary).length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(personSummary).map((pName) => {
                const netAmount = personSummary[pName];
                return (
                  <div
                    key={pName}
                    onClick={() => setFilterPerson(pName === filterPerson ? 'ALL' : pName)}
                    className={cn(
                      'p-4 rounded-3xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer space-y-2 shadow-xs',
                      filterPerson === pName
                        ? 'border-pink-500 ring-2 ring-pink-500/20'
                        : 'border-gray-100 dark:border-zinc-800 hover:border-gray-200',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xs font-black">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {pName}
                      </h3>
                    </div>

                    <div className="pt-1 text-[12px] font-black tabular-nums">
                      <p
                        className={
                          netAmount >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {netAmount >= 0 ? '+' : ''}
                        {formatCurrency(netAmount, 'MMK')}
                      </p>
                      <span className="text-[9px] font-bold text-gray-400">
                        {netAmount >= 0 ? 'Net Holding' : 'Net Returned'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-center space-y-2">
              <p className="text-xs text-gray-400 font-bold">
                No family money records yet. Tap &quot;+ Record Money&quot; to log funds from Mom or
                family!
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: FAMILY TRANSACTIONS HISTORY TABLE */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Family Transfer Activity
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-black flex items-center gap-1 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Image
              </button>
              <span className="text-xs font-black text-pink-600 dark:text-pink-400">🇲🇲 MMK Only</span>
            </div>
          </div>

          {filteredTxs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl flex items-center justify-between gap-3 border border-gray-100 dark:border-zinc-700/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-sm',
                        tx.type === 'received' ? 'bg-emerald-500' : 'bg-rose-500',
                      )}
                    >
                      {tx.type === 'received' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug">
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
                        {tx.addToCurrentBudget === false && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 border border-gray-200 dark:border-zinc-700 shrink-0">
                            Separate Record
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {tx.date} {tx.note ? `• ${tx.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        'font-black text-xs tabular-nums',
                        tx.type === 'received'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400',
                      )}
                    >
                      {tx.type === 'received' ? '+' : '-'}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEditDrawer(tx)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 text-gray-400 hover:text-pink-600 flex items-center justify-center transition-colors"
                      title="Edit Record"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTxId(tx.id)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
            {/* Transfer Type Toggle */}
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

            {/* Person Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Family Member
              </label>

              {/* Preset Chips */}
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

            {/* Amount (MMK) */}
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

            {/* Date & Note */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Date
              </label>
              <DatePicker value={date} onChange={setDate} />
            </div>

            {/* Add to Current Budget Switch */}
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

      {/* Sidebar Drawer */}
      <BudgetSidebarDrawerModal isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
