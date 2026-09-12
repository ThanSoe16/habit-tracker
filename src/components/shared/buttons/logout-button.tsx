'use client';

import { useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import { confirmSettingsNavigation } from '@/features/settings/use-unsaved-changes';
import { authService } from '@/lib/supabase/auth';

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);

  async function handleLogout() {
    if (pending.current || !confirmSettingsNavigation()) return;
    pending.current = true;
    setIsLoading(true);
    setError(null);
    try {
      // AuthGuard redirects to login; the auth listeners clear the active account state.
      await authService.signOut();
      setOpen(false);
    } catch {
      setError('Unable to log out. Please try again.');
    } finally {
      pending.current = false;
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        ref={trigger}
        type="button"
        variant="ghost"
        size="sm"
        aria-haspopup="dialog"
        disabled={isLoading}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <LogOut data-icon="inline-start" aria-hidden="true" />
        Log out
      </Button>
      <ConfirmationDialog
        open={open}
        onClose={() => !pending.current && setOpen(false)}
        title="Log out of Habit Tracker?"
        desc="You’ll return to the login screen. Your saved data will be here when you log back in."
        isDelete={false}
        enableDeleteIcon={false}
        confirmText="Log out"
        loadingText="Logging out…"
        isLoading={isLoading}
        error={error}
        onPress={() => void handleLogout()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus();
        }}
      />
    </>
  );
}
