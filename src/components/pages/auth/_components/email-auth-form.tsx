'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flex } from '@radix-ui/themes';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { authService } from '@/lib/supabase/auth';
import { credentialsSchema } from '@/features/users/types/credentials';

export function EmailAuthForm({ onSignedIn }: { onSignedIn: () => void }) {
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState('');
  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
  });
  const pending = form.formState.isSubmitting;

  async function submit(values: z.infer<typeof credentialsSchema>) {
    setMessage('');
    try {
      const result = register
        ? await authService.signUpWithEmail(values.email, values.password)
        : await authService.signInWithEmail(values.email, values.password);
      if (result.session) {
        form.reset();
        onSignedIn();
      } else {
        setMessage('Check your email to confirm your account, then sign in.');
        form.reset({ email: values.email, password: '' });
        setRegister(false);
      }
    } catch {
      form.setError('root', {
        message: register
          ? 'Could not create your account. Please check your details and try again.'
          : 'Could not sign in. Check your email and password, then try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <Flex direction="column" gap="4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" autoComplete="email" disabled={pending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    autoComplete={register ? 'new-password' : 'current-password'}
                    disabled={pending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending
              ? register
                ? 'Creating account…'
                : 'Signing in…'
              : register
                ? 'Create account'
                : 'Sign in'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setRegister(!register);
              setMessage('');
              form.clearErrors();
            }}
          >
            {register ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Button>
        </Flex>
      </form>
    </Form>
  );
}
