import { createParser } from 'nuqs';
import { z } from 'zod';
import type { FamilyTransaction } from '@/store/use-budget-store';

export const FAMILY_NEEDS = 'Family Needs';
export const PRESET_RELATIONS = [
  'Mom',
  'Dad',
  'Sister',
  'Brother',
  'Wife',
  'Husband',
  FAMILY_NEEDS,
];

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const monthFilterParser = createParser({
  parse: (value) => {
    const result = monthSchema.safeParse(value);
    return result.success ? result.data : null;
  },
  serialize: (value) => value,
});

type FamilyFilters = {
  familyPerson: string;
  familyMonth: string;
};

export function filterFamilyTransactions<
  T extends Pick<FamilyTransaction, 'id' | 'person' | 'date'>,
>(transactions: T[], { familyPerson, familyMonth }: FamilyFilters) {
  // Match the stored year and month without timezone conversion.
  return transactions
    .filter(
      (transaction) =>
        (familyPerson === 'ALL' || transaction.person === familyPerson) &&
        (!familyMonth || transaction.date.slice(0, 7) === familyMonth),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
