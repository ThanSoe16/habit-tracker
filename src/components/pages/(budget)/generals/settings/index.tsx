'use client';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import { useBudgetStore, CURRENCIES, type CurrencyCode } from '@/store/use-budget-store';
import {
  budgetBackupSchema,
  createBudgetBackup,
  type BudgetBackup,
} from '@/features/budget/utils/backup';
import {
  AppSettingsLink,
  SettingsChoice,
  SettingsSaveStatus,
  SettingsSection,
} from '@/components/settings/settings-controls';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { useUnsavedChanges } from '@/features/settings/use-unsaved-changes';

const codes = Object.keys(CURRENCIES) as CurrencyCode[];

function WalletForm() {
  const { walletBalances, importBudgetData } = useBudgetStore();
  const [draft, setDraft] = useState<Partial<Record<CurrencyCode, string>>>({});
  const dirty = Object.keys(draft).length > 0;
  useUnsavedChanges(dirty);
  const [error, setError] = useState('');
  const save = (event: FormEvent) => {
    event.preventDefault();
    const updates = Object.fromEntries(
      Object.entries(draft).map(([code, value]) => [code, Number(value)]),
    );
    if (
      Object.values(draft).some((value) => !value?.trim()) ||
      Object.values(updates).some((value) => !Number.isFinite(value) || value < 0)
    ) {
      setError('Enter a valid, nonnegative balance for each wallet.');
      return;
    }
    importBudgetData({ walletBalances: { ...walletBalances, ...updates } });
    setDraft({});
    setError('');
  };
  return (
    <form onSubmit={save}>
      <FieldGroup>
        {codes.map((code) => (
          <Field key={code} data-invalid={!!error || undefined}>
            <FieldLabel htmlFor={`balance-${code}`}>{CURRENCIES[code].name} balance</FieldLabel>
            <Input
              id={`balance-${code}`}
              type="number"
              min="0"
              step="any"
              required
              value={draft[code] ?? walletBalances[code]}
              onChange={(event) => setDraft({ ...draft, [code]: event.target.value })}
              aria-invalid={!!error}
              aria-describedby={error ? 'balance-error' : undefined}
            />
          </Field>
        ))}
        {error && (
          <p id="balance-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!dirty}>
            Save balances
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!dirty}
            onClick={() => {
              setDraft({});
              setError('');
            }}
          >
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

export default function BudgetSettingsPage() {
  const store = useBudgetStore();
  const [backup, setBackup] = useState<BudgetBackup | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const exportBackup = () => {
    try {
      const blob = new Blob([JSON.stringify(createBudgetBackup(store), null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `habit-budget-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error('Could not export this budget. Check your records for invalid values.');
    }
  };
  const readBackup = async (file?: File) => {
    if (!file) return;
    setReading(true);
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('Backup must be smaller than 20 MB.');
      const result = budgetBackupSchema.safeParse(JSON.parse(await file.text()));
      if (!result.success)
        throw new Error('This is not a supported budget backup, or it contains invalid records.');
      setBackup(result.data);
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? 'The file is not valid JSON.'
          : error instanceof Error
            ? error.message
            : 'Could not read backup.',
      );
    } finally {
      setReading(false);
    }
  };
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 pb-8">
      <SettingsSaveStatus scope="budget" />
      <SettingsSection
        title="Currency"
        description="Choose the default display currency. This does not exchange your funds."
      >
        <SettingsChoice
          label="Display currency"
          value={store.currency}
          onChange={store.setCurrency}
          options={codes.map((code) => ({ value: code, label: code }))}
        />
      </SettingsSection>
      <SettingsSection
        title="Adjust wallet balances"
        description="Replace current balances directly. These adjustments do not create transactions."
      >
        <WalletForm key={formKey} />
      </SettingsSection>
      <SettingsSection
        title="Backup & restore"
        description="Back up balances, transactions, salary templates, family records, loans, gold holdings, and budget preferences."
      >
        <Button variant="outline" onClick={exportBackup}>
          <Download data-icon="inline-start" />
          Export backup
        </Button>
        <Field>
          <FieldLabel htmlFor="budget-import">
            <Upload className="size-4" />
            Import backup
          </FieldLabel>
          <Input
            id="budget-import"
            type="file"
            accept=".json,application/json"
            disabled={reading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              void readBackup(file);
            }}
          />
          <FieldDescription>
            {reading
              ? 'Validating backup…'
              : 'JSON, up to 20 MB. Review the contents before restoring.'}
          </FieldDescription>
        </Field>
      </SettingsSection>
      <SettingsSection
        title="Delete budget data"
        description="Delete transactions, salary templates, family records, loans, and gold holdings, and set wallet balances to zero. Other modules are unaffected."
      >
        <Button variant="destructive" onClick={() => setResetOpen(true)}>
          Reset budget data
        </Button>
      </SettingsSection>
      <AppSettingsLink />
      <AlertDialog
        open={!!backup}
        onOpenChange={(open) => {
          if (!open) setBackup(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore budget backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces the categories included in the file. Export your current budget first if
              you want to keep it. Unsaved wallet edits will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {backup && (
            <div className="flex flex-col gap-2 text-sm">
              <p>Exported {new Date(backup.exportedAt).toLocaleString()}</p>
              <p>
                {backup.budgetEntries.length} transactions · {backup.monthlySalaries.length}{' '}
                salaries · {backup.familyTransactions.length} family records
              </p>
              <p>
                {backup.loans?.length ?? 'Unchanged'} loans ·{' '}
                {backup.goldHoldings?.length ?? 'Unchanged'} gold holdings
              </p>
              <p>
                {backup.version === '2.0'
                  ? 'Older backup: any missing categories and preferences will be kept.'
                  : 'Complete backup: all budget categories and preferences will be replaced.'}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (backup) {
                  store.importBudgetData(backup);
                  setFormKey((key) => key + 1);
                  setBackup(null);
                }
              }}
            >
              Restore backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all budget data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes all budget records and zeros your balances. Export a backup
              first if you may need these records later. Unsaved wallet edits will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                store.resetBudgetData();
                setFormKey((key) => key + 1);
              }}
            >
              Reset budget data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
