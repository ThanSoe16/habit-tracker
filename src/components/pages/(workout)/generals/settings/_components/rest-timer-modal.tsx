'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SettingsChoice } from '@/components/settings/settings-controls';

export function RestTimerModal({
  isOpen,
  onClose,
  initialSeconds,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds: number;
  onSave: (seconds: number) => void;
}) {
  const [seconds, setSeconds] = useState(String(initialSeconds));
  const valid =
    Number.isInteger(Number(seconds)) && Number(seconds) >= 15 && Number(seconds) <= 600;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rest timer</DialogTitle>
          <DialogDescription>
            Set the default rest between sets, from 15 seconds to 10 minutes.
          </DialogDescription>
        </DialogHeader>
        <SettingsChoice
          label="Quick choices"
          value={seconds}
          onChange={setSeconds}
          options={[30, 60, 90, 120, 180].map((value) => ({
            value: String(value),
            label: `${value}s`,
          }))}
        />
        <Field>
          <FieldLabel htmlFor="rest-seconds">Duration in seconds</FieldLabel>
          <Input
            id="rest-seconds"
            type="number"
            min={15}
            max={600}
            step={1}
            value={seconds}
            onChange={(event) => setSeconds(event.target.value)}
            aria-invalid={!valid}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              onSave(Number(seconds));
              onClose();
            }}
          >
            Save timer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
