'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyCode, CURRENCIES, DEFAULT_EXCHANGE_RATES, formatCurrency } from '@/store/use-budget-store';
import { Flex } from '@radix-ui/themes';
import { ArrowRightLeft } from 'lucide-react';

interface BudgetExchangeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchangeFrom: CurrencyCode;
  exchangeTo: CurrencyCode;
  exchangeFromAmount: string;
  exchangeRate: string;
  walletBalances: Record<CurrencyCode, number>;
  onFromChange: (c: CurrencyCode) => void;
  onToChange: (c: CurrencyCode) => void;
  onFromAmountChange: (val: string) => void;
  onRateChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BudgetExchangeDrawer({
  open,
  onOpenChange,
  exchangeFrom,
  exchangeTo,
  exchangeFromAmount,
  exchangeRate,
  walletBalances,
  onFromChange,
  onToChange,
  onFromAmountChange,
  onRateChange,
  onSubmit,
}: BudgetExchangeDrawerProps) {
  const calculatedToAmount = (parseFloat(exchangeFromAmount) || 0) * (parseFloat(exchangeRate) || 1);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-lg mx-auto p-6 rounded-t-3xl bg-card border-t border-border">
        <DrawerTitle className="text-xl font-extrabold text-foreground mb-4">
          Exchange Currency
        </DrawerTitle>

        <form onSubmit={onSubmit} className="space-y-5">
          <Flex direction="column" gap="3">
            <span className="text-xs font-bold text-muted-foreground uppercase">From Currency</span>
            <Flex gap="3" align="center">
              <Select value={exchangeFrom} onValueChange={(val) => onFromChange(val as CurrencyCode)}>
                <SelectTrigger className="w-32 h-12 rounded-2xl bg-muted border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <MoneyInput
                value={exchangeFromAmount}
                setValue={onFromAmountChange}
                placeholder="0.00"
                preFix={CURRENCIES[exchangeFrom]?.symbol}
                className="flex-1 h-12 rounded-2xl bg-muted border-none font-bold text-lg"
              />
            </Flex>
            <p className="text-xs text-muted-foreground">
              Available: {formatCurrency(walletBalances[exchangeFrom] || 0, exchangeFrom)}
            </p>
          </Flex>

          <Flex justify="center" my="2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </Flex>

          <Flex direction="column" gap="3">
            <span className="text-xs font-bold text-muted-foreground uppercase">To Currency</span>
            <Flex gap="3" align="center">
              <Select value={exchangeTo} onValueChange={(val) => onToChange(val as CurrencyCode)}>
                <SelectTrigger className="w-32 h-12 rounded-2xl bg-muted border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1 h-12 rounded-2xl bg-muted flex items-center px-4 font-bold text-lg text-foreground">
                {formatCurrency(calculatedToAmount, exchangeTo)}
              </div>
            </Flex>
          </Flex>

          <Flex direction="column" gap="2">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              Rate (1 {exchangeFrom} = ? {exchangeTo})
            </span>
            <MoneyInput
              value={exchangeRate}
              setValue={onRateChange}
              placeholder="1.0"
              className="w-full h-12 rounded-2xl bg-muted border-none font-bold"
            />
          </Flex>

          <Button type="submit" className="w-full h-12 rounded-2xl font-bold bg-primary text-primary-foreground text-base mt-2">
            Confirm Exchange
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
