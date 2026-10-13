import type { ReactNode } from 'react';
import { Grid } from '@radix-ui/themes';
import { Plus, Users } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { formatCurrency } from '@/store/use-budget-store';
import { cn } from '@/utils/cn';
import styles from './family-filters.module.css';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FamilySummaryProps = {
  filterPerson: string;
  setFilterPerson: (person: string) => void;
  allPeopleList: string[];
  totalReceived: number;
  totalGivenBack: number;
  netFamilyTotal: number;
  handleOpenCreateDrawer: () => void;
  children: ReactNode;
};

export function FamilySummary({
  filterPerson,
  setFilterPerson,
  allPeopleList,
  totalReceived,
  totalGivenBack,
  netFamilyTotal,
  handleOpenCreateDrawer,
  children,
}: FamilySummaryProps) {
  return (
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

      <Grid columns="2" gap="3" align="start" className={styles.filterRow}>
        <Field className="min-w-0">
          <FieldLabel htmlFor="family-person">Family member</FieldLabel>
          <Select value={filterPerson} onValueChange={(val) => setFilterPerson(val)}>
            <SelectTrigger id="family-person" className={styles.filterControl}>
              <span className={styles.controlValue}>
                <Users aria-hidden="true" />
                <SelectValue className="min-w-0 truncate">
                  <span className="truncate">
                    {filterPerson === 'ALL' ? 'All members' : filterPerson}
                  </span>
                </SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 text-slate-950 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl z-[100]">
              <SelectGroup>
                <SelectItem
                  value="ALL"
                  className="text-sm font-semibold py-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  All members
                </SelectItem>
                {allPeopleList.map((pName) => (
                  <SelectItem
                    key={pName}
                    value={pName}
                    className="text-sm font-semibold py-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    {pName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {children}
      </Grid>

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
  );
}
