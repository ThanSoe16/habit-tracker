'use client';

import { useId, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsSync, type SettingsScope } from '@/features/settings/sync-status';

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <FieldGroup>{children}</FieldGroup>
      </CardContent>
    </Card>
  );
}

export function SettingsSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <Field orientation="horizontal" data-disabled={disabled || undefined}>
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      </FieldContent>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
      />
    </Field>
  );
}

export function SettingsChoice<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description?: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel id={id}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <ToggleGroup
        type="single"
        variant="primary"
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as T);
        }}
        aria-labelledby={id}
        className="flex-wrap"
        size="lg"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}

export function SettingsSaveStatus({ scope = 'profile' }: { scope?: SettingsScope }) {
  const sync = useSettingsSync((state) => state[scope]);
  return (
    <div
      className="flex min-h-9 items-center justify-between gap-3 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span>
        {sync.status === 'error'
          ? `Changes could not sync. ${sync.error ?? ''}`
          : sync.status === 'saving'
            ? 'Saving changes…'
            : sync.status === 'saved'
              ? 'All changes saved.'
              : 'Preferences save automatically.'}
      </span>
      {sync.status === 'error' && (
        <Button variant="outline" size="sm" onClick={sync.retry}>
          <RefreshCw data-icon="inline-start" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function AppSettingsLink() {
  return (
    <SettingsSection
      title="Account & app"
      description="Profile, appearance, sound, and notification preferences apply across the app."
    >
      <Button variant="outline" asChild>
        <Link href="/account">
          Open account settings
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    </SettingsSection>
  );
}

export function SettingsLoading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading settings">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
      <span className="sr-only">Loading settings</span>
    </div>
  );
}
