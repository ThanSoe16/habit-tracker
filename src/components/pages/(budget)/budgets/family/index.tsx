'use client';
import { QueryFeedback } from '@/components/shared/infinite-list/query-feedback';
import {
  useBudgetList,
  useFamilySummary,
  useBudgetExport,
} from '@/features/budget/services/list-queries';
import { InfiniteListEnd } from '@/components/shared/infinite-list';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { parseAsString, useQueryStates } from 'nuqs';
import { useBudgetStore, type FamilyTransaction } from '@/store/use-budget-store';
import { ExportTableModal } from '../../_components/export-table-modal';
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
import { FamilySummary } from './_components/family-summary';
import { FamilyHistory } from './_components/family-history';
import { FamilyTransferDrawer } from './_components/family-transfer-drawer';
import { FamilyMonthFilter } from './_components/family-month-filter';
import {
  FAMILY_NEEDS,
  PRESET_RELATIONS,
  monthFilterParser,
  filterFamilyTransactions,
} from './family-filters';

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
  const [filters, setFilters] = useQueryStates(
    {
      familyPerson: parseAsString.withDefault('ALL'),
      familyMonth: monthFilterParser.withDefault(''),
    },
    { history: 'push' },
  );
  const filterPerson = filters.familyPerson;

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

  const query = useBudgetList('family', filters);
  const summary = useFamilySummary();
  const statement = useBudgetExport('family', isExportModalOpen);
  const summaryTransactions = summary.data ?? [];
  const filteredSummary = filterFamilyTransactions(summaryTransactions, filters);
  // Filtered transactions
  const filteredTxs = filterFamilyTransactions(
    familyTransactions.filter((tx) => query.ids.has(tx.id)),
    filters,
  );

  // Calculate Net Holding Summary in MMK per Person
  const personSummary: Record<string, number> = {};

  summaryTransactions.forEach((tx) => {
    if (personSummary[tx.person] === undefined) {
      personSummary[tx.person] = 0;
    }
    if (tx.type === 'received') {
      personSummary[tx.person] += tx.amount;
    } else {
      personSummary[tx.person] -= tx.amount;
    }
  });

  const totalReceived = filteredSummary
    .filter((t) => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGivenBack = filteredSummary
    .filter((t) => t.type === 'given')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFamilyTotal = totalReceived - totalGivenBack;

  const allPeopleList = Array.from(
    new Set([
      ...Object.keys(personSummary),
      ...summaryTransactions.map((t) => t.person),
      FAMILY_NEEDS,
    ]),
  );

  return (
    <div className="space-y-5">
      <FamilySummary
        filterPerson={filterPerson}
        setFilterPerson={(person) => {
          void setFilters({ familyPerson: person });
        }}
        allPeopleList={allPeopleList}
        totalReceived={totalReceived}
        totalGivenBack={totalGivenBack}
        netFamilyTotal={netFamilyTotal}
        handleOpenCreateDrawer={handleOpenCreateDrawer}
      >
        <FamilyMonthFilter
          month={filters.familyMonth}
          onChange={(value) => {
            void setFilters({ familyMonth: value || null });
          }}
        />
      </FamilySummary>

      <FamilyHistory
        filteredTxs={filteredTxs}
        onExport={() => setIsExportModalOpen(true)}
        handleOpenEditDrawer={handleOpenEditDrawer}
        setDeleteTxId={setDeleteTxId}
      />

      <FamilyTransferDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        editingTx={editingTx}
        handleFormSubmit={handleFormSubmit}
        txType={txType}
        setTxType={setTxType}
        person={person}
        setPerson={setPerson}
        customPerson={customPerson}
        setCustomPerson={setCustomPerson}
        amount={amount}
        setAmount={setAmount}
        date={date}
        setDate={setDate}
        note={note}
        setNote={setNote}
        addToCurrentBudget={addToCurrentBudget}
        setAddToCurrentBudget={setAddToCurrentBudget}
      />

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
        isOpen={isExportModalOpen && Boolean(statement.data)}
        onClose={() => setIsExportModalOpen(false)}
        title="Family Money Transfer Statement"
        subtitle={`${filterPerson === 'ALL' ? 'All Family Members' : filterPerson} | ${filters.familyMonth || 'All months'} (MMK)`}
        rows={filterFamilyTransactions(statement.data?.familyTransactions ?? [], filters).map(
          (t) => ({
            date: t.date,
            from: t.person,
            categoryOrType: t.type === 'received' ? 'Received from Family' : 'Given to Family',
            amount: t.amount,
            currency: 'MMK',
            isPositive: t.type === 'received',
          }),
        )}
      />
      <InfiniteListEnd query={query} />
      <QueryFeedback query={summary} label="family totals" />
      <QueryFeedback query={statement} label="statement" />
    </div>
  );
}
