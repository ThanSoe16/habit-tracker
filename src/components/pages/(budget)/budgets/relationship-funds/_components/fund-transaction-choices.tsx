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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { FundTransactionInput } from '@/features/relationship-funds/types';

export function FundTransactionChoices({ form }: { form: UseFormReturn<FundTransactionInput> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="kind"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold">Transaction type</FormLabel>
            <FormControl>
              <ToggleGroup
                type="single"
                value={field.value}
                aria-label="Transaction type"
                onBlur={field.onBlur}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
                disabled={form.formState.isSubmitting}
                className="w-full rounded-xl bg-muted p-1"
              >
                <ToggleGroupItem
                  value="save"
                  className="h-11 flex-1 rounded-lg data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
                >
                  Save money
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="spend"
                  className="h-11 flex-1 rounded-lg data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
                >
                  Spend money
                </ToggleGroupItem>
              </ToggleGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="person"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold">Person</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={form.formState.isSubmitting}
            >
              <FormControl>
                <SelectTrigger className="h-12 w-full rounded-2xl">
                  <SelectValue placeholder="Choose person" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-2xl">
                <SelectGroup>
                  <SelectItem value="TSO">TSO</SelectItem>
                  <SelectItem value="Nway">Nway</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <p className="text-xs leading-relaxed text-muted-foreground" aria-live="polite">
        Saving and spending change only your relationship fund. Available stays unchanged.
      </p>
    </>
  );
}
