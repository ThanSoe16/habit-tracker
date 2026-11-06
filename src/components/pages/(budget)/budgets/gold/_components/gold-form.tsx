'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Flex, Grid } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MoneyInput } from '@/components/ui/money-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES, formatCurrency, type WalletBalances } from '@/features/budget/store/model';
import type { GoldFormValues } from '@/features/budget/types/gold-form';

type GoldFormProps = {
  form: UseFormReturn<GoldFormValues>;
  editing: boolean;
  walletBalances: WalletBalances;
  onSubmit: (values: GoldFormValues) => void;
};

export function GoldForm({ form, editing, walletBalances, onSubmit }: GoldFormProps) {
  const pending = form.formState.isSubmitting;
  const currency = form.watch('currency');
  const sold = form.watch('status') === 'sold';
  const error = form.formState.errors.root?.server?.message;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-busy={pending}>
        <fieldset disabled={pending}>
          <legend className="sr-only">Gold record details</legend>
          <Flex direction="column" gap="4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Gold weight</legend>
              <Grid columns="3" gap="2">
                {(
                  [
                    ['kyat', 'ကျပ်သား', undefined],
                    ['pae', 'ပဲ', 15],
                    ['yway', 'ရွေး', 7],
                  ] as const
                ).map(([name, label, max]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min={0} max={max} step={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </Grid>
              <p className="mt-2 text-xs text-muted-foreground">1 ကျပ်သား = 16 ပဲ = 128 ရွေး</p>
            </fieldset>
            <FormField
              control={form.control}
              name="buyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total purchase price</FormLabel>
                  <FormControl>
                    <MoneyInput
                      {...field}
                      value={field.value || ''}
                      setValue={field.onChange}
                      postfix={currency}
                      placeholder="Enter total price"
                      disabled={pending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Grid columns={{ initial: '1', sm: '2' }} gap="3">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(CURRENCIES).map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              {item.flag} {item.code}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Grid>
            {sold && (
              <>
                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total selling price</FormLabel>
                      <FormControl>
                        <MoneyInput
                          {...field}
                          value={field.value || ''}
                          setValue={field.onChange}
                          postfix={currency}
                          disabled={pending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soldDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sold date</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Shop, purity, item details..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Available: {formatCurrency(walletBalances[currency] || 0, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {editing
                ? 'Changes to prices or currency also adjust your wallet balance.'
                : 'The purchase price will be deducted from your wallet.'}
            </p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : editing ? 'Save Changes' : 'Save Purchase'}
            </Button>
          </Flex>
        </fieldset>
      </form>
    </Form>
  );
}
