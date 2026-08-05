'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Flex, Grid } from '@radix-ui/themes';
import { FamilyTransaction, CurrencyCode } from '@/store/use-budget-store';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const PRESET_RELATIONS = ['Mom', 'Dad', 'Sister', 'Brother', 'Wife', 'Husband'];

interface FamilyTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx: FamilyTransaction | null;
  txType: 'received' | 'given';
  setTxType: (type: 'received' | 'given') => void;
  person: string;
  setPerson: (p: string) => void;
  customPerson: string;
  setCustomPerson: (p: string) => void;
  amount: string;
  setAmount: (amt: string) => void;
  date: string;
  setDate: (d: string) => void;
  note: string;
  setNote: (n: string) => void;
  addToCurrentBudget: boolean;
  setAddToCurrentBudget: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FamilyTransactionDrawer({
  isOpen,
  onClose,
  editingTx,
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
  onSubmit,
}: FamilyTransactionDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-w-md mx-auto p-6 rounded-t-3xl bg-card border-t border-border">
        <DrawerHeader className="p-0 mb-4">
          <DrawerTitle className="text-xl font-extrabold text-card-foreground">
            {editingTx ? 'Edit Family Record' : 'Log Family Money'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Type Toggle */}
          <Grid columns="2" gap="3">
            <button
              type="button"
              onClick={() => setTxType('received')}
              className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                txType === 'received'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted border-transparent text-muted-foreground'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" /> Received Money
            </button>
            <button
              type="button"
              onClick={() => setTxType('given')}
              className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                txType === 'given'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'bg-muted border-transparent text-muted-foreground'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Sent / Given
            </button>
          </Grid>

          {/* Relation Selection */}
          <Flex direction="column" gap="1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Family Member</label>
            <Select value={person} onValueChange={setPerson}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Select relation" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_RELATIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
                <SelectItem value="CUSTOM">+ Custom Person</SelectItem>
              </SelectContent>
            </Select>

            {person === 'CUSTOM' && (
              <Input
                placeholder="Enter person name"
                value={customPerson}
                onChange={(e) => setCustomPerson(e.target.value)}
                className="mt-2"
              />
            )}
          </Flex>

          {/* Amount Input */}
          <Flex direction="column" gap="1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Amount (MMK)</label>
            <MoneyInput
              value={amount}
              setValue={(val) => setAmount(val || '')}
              placeholder="0"
              className="h-12 text-lg font-bold"
            />
          </Flex>

          {/* Note Input */}
          <Flex direction="column" gap="1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Note / Details</label>
            <Input
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Flex>

          {/* Add to Current Wallet Switch */}
          <Flex align="center" justify="between" className="p-3 bg-muted/40 rounded-2xl border border-border">
            <Flex direction="column">
              <span className="text-xs font-bold text-foreground">Sync with Wallet</span>
              <span className="text-[10px] text-muted-foreground">Adjust current wallet balance automatically</span>
            </Flex>
            <Switch checked={addToCurrentBudget} onCheckedChange={setAddToCurrentBudget} />
          </Flex>

          <Button type="submit" className="w-full h-12 rounded-2xl font-bold text-sm mt-4">
            {editingTx ? 'Update Entry' : 'Save Entry'}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
