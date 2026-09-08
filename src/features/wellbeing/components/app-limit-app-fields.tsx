'use client';

import { useWatch, type UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppUsage } from '../types';
import { CUSTOM_APP_OPTION, type AppLimitFormValues } from '../types/app-limit-form';

export function AppLimitAppFields({
  form,
  availableApps,
}: {
  form: UseFormReturn<AppLimitFormValues>;
  availableApps: AppUsage[];
}) {
  const selectedApp = useWatch({ control: form.control, name: 'appIdentifier' });
  const pending = form.formState.isSubmitting;
  return (
    <>
      <FormField
        control={form.control}
        name="appIdentifier"
        render={({ field }) => (
          <FormItem className="grid gap-2">
            <FormLabel>App</FormLabel>
            <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
              <FormControl>
                <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                  <SelectValue placeholder="Choose an app" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  {availableApps.map((app) => (
                    <SelectItem key={app.appIdentifier} value={app.appIdentifier}>
                      {app.appName}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_APP_OPTION}>Other app…</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {selectedApp === CUSTOM_APP_OPTION && (
        <FormField
          control={form.control}
          name="customAppName"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>App name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Facebook, Minecraft"
                  className="h-11"
                  inputClassName="rounded-2xl bg-background"
                  maxLength={80}
                  showCharacterCount={false}
                  disabled={pending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
