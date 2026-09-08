'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { Flex } from '@radix-ui/themes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Slider } from '@/components/ui/slider';
import { useSubmissionScope } from '@/features/base/hooks/use-submission-scope';
import {
  confirmSettingsNavigation,
  useUnsavedChanges,
} from '@/features/settings/use-unsaved-changes';
import { digitalWellbeingService } from '../services/supabase';
import type { AppLimit, AppUsage } from '../types';
import { appLimitFormSchema, type AppLimitFormValues } from '../types/app-limit-form';
import { formatDuration } from '../utils/format-duration';
import { resolveLimitApp } from '../utils/resolve-limit-app';
import { AppLimitAppFields } from './app-limit-app-fields';

export type AppLimitDialogState = { mode: 'create' } | { mode: 'edit'; limit: AppLimit };

function AppLimitForm({
  form,
  mode,
  availableApps,
  onSubmit,
  onClose,
}: {
  form: UseFormReturn<AppLimitFormValues>;
  mode: AppLimitDialogState['mode'];
  availableApps: AppUsage[];
  onSubmit: (values: AppLimitFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const pending = form.formState.isSubmitting;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Flex direction="column" className="flex flex-col gap-5">
          {mode === 'create' && <AppLimitAppFields form={form} availableApps={availableApps} />}
          <FormField
            control={form.control}
            name="dailyLimitSeconds"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel className="flex items-center justify-between gap-3">
                  <span>Daily limit</span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatDuration(field.value)}
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    ref={field.ref}
                    onBlur={field.onBlur}
                    aria-label="Daily limit"
                    className="py-2"
                    value={[field.value]}
                    min={900}
                    max={14400}
                    step={900}
                    disabled={pending}
                    onValueChange={(value) => field.onChange(value[0] ?? 900)}
                  />
                </FormControl>
                <Flex
                  className="flex items-center justify-between text-xs text-muted-foreground"
                  aria-hidden="true"
                >
                  <span>15 minutes</span>
                  <span>4 hours</span>
                </Flex>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warningBeforeSeconds"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Warn me before</FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(Number(value))}
                  disabled={pending}
                >
                  <FormControl>
                    <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                      <SelectItem value="900">15 minutes</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : mode === 'create' ? 'Create limit' : 'Save limit'}
            </Button>
          </DialogFooter>
        </Flex>
      </form>
    </Form>
  );
}

export function AppLimitDialog({
  state,
  availableApps,
  existingLimits,
  onClose,
  onSaved,
}: {
  state: AppLimitDialogState;
  availableApps: AppUsage[];
  existingLimits: AppLimit[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const scope = useSubmissionScope();
  const limit = state.mode === 'edit' ? state.limit : null;
  const form = useForm<AppLimitFormValues>({
    resolver: zodResolver(appLimitFormSchema),
    defaultValues: {
      appIdentifier: limit?.appIdentifier ?? '',
      customAppName: '',
      dailyLimitSeconds: limit?.dailyLimitSeconds ?? 3600,
      warningBeforeSeconds: limit?.warningBeforeSeconds ?? 300,
    },
  });
  useUnsavedChanges(form.formState.isDirty);

  const close = () => {
    if (!form.formState.isSubmitting && confirmSettingsNavigation()) onClose();
  };

  const save = async (values: AppLimitFormValues) => {
    const resolved = limit
      ? { app: limit }
      : resolveLimitApp(values, availableApps, existingLimits);
    if (resolved.error) {
      form.setError(resolved.error.field, { message: resolved.error.message });
      return;
    }
    const app = resolved.app;
    try {
      await scope.assertCurrent();
      await digitalWellbeingService.upsertAppLimit({
        app_identifier: app.appIdentifier,
        app_name: app.appName,
        daily_limit_seconds: values.dailyLimitSeconds,
        warning_before_seconds: values.warningBeforeSeconds,
        is_enabled: limit?.enabled ?? true,
      });
    } catch {
      if (scope.isCurrent())
        form.setError('root', { message: 'Could not save the limit. Please try again.' });
      return;
    }
    if (!scope.isCurrent()) return;
    form.reset(values);
    toast.success(`${app.appName} limit ${state.mode === 'create' ? 'created' : 'updated'}.`);
    onClose();
    await onSaved();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state.mode === 'create' ? 'Create app limit' : `Edit ${state.limit.appName} limit`}
          </DialogTitle>
          <DialogDescription>
            {state.mode === 'create'
              ? 'Choose an app, daily duration, and warning time.'
              : 'Choose a daily duration and warning time.'}
          </DialogDescription>
        </DialogHeader>
        <AppLimitForm
          form={form}
          mode={state.mode}
          availableApps={availableApps}
          onSubmit={save}
          onClose={close}
        />
      </DialogContent>
    </Dialog>
  );
}
