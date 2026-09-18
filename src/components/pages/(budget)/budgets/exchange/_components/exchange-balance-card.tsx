'use client';

import { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { Card, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES, type CurrencyCode, useBudgetStore } from '@/store/use-budget-store';
import { CurrentBudgetBalance } from '../../../_components/current-budget-balance';

export function ExchangeBalanceCard() {
  const defaultCurrency = useBudgetStore((state) => state.currency);
  const walletBalances = useBudgetStore((state) => state.walletBalances);
  const [selectedCurrency, setCurrency] = useState<CurrencyCode | null>(null);
  const currency = selectedCurrency ?? defaultCurrency;

  return (
    <Card className="rounded-4xl border border-border py-6 shadow-xl ring-0">
      <CardHeader className="gap-2 px-6 text-center">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">Current Balance</p>
        <CurrentBudgetBalance currency={currency} spendable={walletBalances[currency] || 0} />
        <Flex className="flex justify-center pt-1">
          <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
            <SelectTrigger
              aria-label="Balance currency"
              className="h-11 w-auto gap-2 rounded-full bg-muted px-4 shadow-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(CURRENCIES).map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    <span aria-hidden="true">{item.flag}</span> {item.code}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Flex>
      </CardHeader>
    </Card>
  );
}
