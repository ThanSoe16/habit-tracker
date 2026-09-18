'use client';
import { type UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FundTransactionInput } from '@/features/relationship-funds/types';

const choices = [
  {
    name: 'kind',
    label: 'Transaction type',
    options: [
      ['save', 'Save money'],
      ['spend', 'Spend money'],
    ],
  },
  {
    name: 'person',
    label: 'Person',
    options: [
      ['TSO', 'TSO'],
      ['Nway', 'Nway'],
    ],
  },
] as const;

export function FundTransactionChoices({ form }: { form: UseFormReturn<FundTransactionInput> }) {
  return (
    <>
      {choices.map(({ name, label, options }) => (
        <FormField
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold">{label}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={form.formState.isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="h-12 w-full rounded-2xl">
                    <SelectValue placeholder={`Choose ${label.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-2xl">
                  <SelectGroup>
                    {options.map(([value, text]) => (
                      <SelectItem key={value} value={value}>
                        {text}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      <p className="text-xs leading-relaxed text-muted-foreground" aria-live="polite">
        Saving and spending change only your relationship fund. Available stays unchanged.
      </p>
    </>
  );
}
