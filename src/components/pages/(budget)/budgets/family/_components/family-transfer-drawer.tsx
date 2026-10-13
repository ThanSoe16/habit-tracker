import type { FormEvent } from 'react';
import { Users, X, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import type { FamilyTransaction } from '@/store/use-budget-store';
import { MoneyInput } from '@/components/ui/money-input';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/cn';
import { PRESET_RELATIONS } from '../family-filters';

type FamilyTransferDrawerProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  editingTx: FamilyTransaction | null;
  handleFormSubmit: (event: FormEvent) => void;
  txType: 'received' | 'given';
  setTxType: (type: 'received' | 'given') => void;
  person: string;
  setPerson: (person: string) => void;
  customPerson: string;
  setCustomPerson: (person: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  date: string;
  setDate: (date: string) => void;
  note: string;
  setNote: (note: string) => void;
  addToCurrentBudget: boolean;
  setAddToCurrentBudget: (add: boolean) => void;
};

export function FamilyTransferDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  editingTx,
  handleFormSubmit,
  txType,
  setTxType,
  person,
  setPerson,
  customPerson,
  setCustomPerson,
  amount,
  setAmount,
  date,
  setDate,
  note,
  setNote,
  addToCurrentBudget,
  setAddToCurrentBudget,
}: FamilyTransferDrawerProps) {
  return (
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
  );
}
