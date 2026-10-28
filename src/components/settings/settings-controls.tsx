'use client';

import { useId, type ReactNode } from 'react';
import { CheckCircle2, Cloud, CloudOff, LoaderCircle, RefreshCw, UserRound } from 'lucide-react';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  SettingsSectionHeader,
  type SettingsSectionHeaderProps,
} from '@/components/shared/settings/settings-section-header';
import { SettingsAction } from '@/components/shared/settings/settings-action';
import { cn } from '@/utils/cn';
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
  icon,
  footer,
}: SettingsSectionHeaderProps & {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <SettingsSectionHeader title={title} description={description} icon={icon} />
      <CardContent>
        <FieldGroup>{children}</FieldGroup>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
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
    <Field
      orientation="horizontal"
      data-disabled={disabled || undefined}
      className="gap-4 rounded-xl border border-border bg-muted/20 p-3"
    >
      <FieldContent className="min-w-0">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      </FieldContent>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
        className="mt-1 shrink-0"
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
      {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      <ToggleGroup
        type="single"
        variant="primary"
        value={value}
        onValueChange={(next) => {
          const option = options.find((option) => option.value === next);
          if (option) onChange(option.value);
        }}
        aria-labelledby={id}
        aria-describedby={description ? `${id}-description` : undefined}
        className="max-w-full flex-wrap"
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
  const Icon =
    sync.status === 'error'
      ? CloudOff
      : sync.status === 'saving'
        ? LoaderCircle
        : sync.status === 'saved'
          ? CheckCircle2
          : Cloud;
  return (
    <Flex
      align="center"
      justify="between"
      gap="3"
      className="rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Flex align="center" gap="2">
        <Icon
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0',
            sync.status === 'saving' && 'animate-spin motion-reduce:animate-none',
            sync.status === 'error' && 'text-destructive',
          )}
        />
        <span>
          {sync.status === 'error'
            ? `Changes could not sync. ${sync.error ?? ''}`
            : sync.status === 'saving'
              ? 'Saving changes…'
              : sync.status === 'saved'
                ? 'All changes saved.'
                : 'Preferences save automatically.'}
        </span>
      </Flex>
      {sync.status === 'error' && (
        <Button variant="outline" size="sm" onClick={sync.retry}>
          <RefreshCw data-icon="inline-start" />
          Retry
        </Button>
      )}
    </Flex>
  );
}

export function AppSettingsLink() {
  return (
    <SettingsSection
      title="Account & app"
      icon={UserRound}
      description="Profile, appearance, sound, and notification preferences apply across the app."
    >
      <SettingsAction
        href="/account"
        label="Open account settings"
        description="Manage your profile and app preferences"
      />
    </SettingsSection>
  );
}

export function SettingsLoading() {
  return (
    <Flex direction="column" gap="5" role="status" aria-label="Loading settings">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <span className="sr-only">Loading settings</span>
    </Flex>
  );
}
