'use client';
import { useUnsavedChanges } from '@/features/settings/use-unsaved-changes';
import { useState } from 'react';
import { useUserStore } from '@/store/use-user-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { SettingsChoice, SettingsSection } from '@/components/settings/settings-controls';

const emojis = ['😊', '😎', '🤓', '🦊', '🐱', '🐶', '🌸', '🔥', '⭐', '🎯', '💪', '🧘'];
export function ProfileCard() {
  const { name, avatarEmoji, setName, setAvatarEmoji, isLoaded } = useUserStore();
  const [draft, setDraft] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const value = draft ?? name;
  useUnsavedChanges(editing && value !== name);
  return (
    <SettingsSection
      title="Profile"
      description="Your name and avatar are shared across every module."
    >
      <fieldset disabled={!isLoaded} className="flex min-w-0 flex-col gap-4">
        <SettingsChoice
          label="Avatar"
          value={avatarEmoji}
          onChange={setAvatarEmoji}
          options={emojis.map((emoji) => ({ value: emoji, label: emoji }))}
        />
        {editing ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (value.trim()) {
                setName(value.trim());
                setEditing(false);
                setDraft(null);
              }
            }}
            className="flex flex-col gap-3"
          >
            <Field>
              <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
              <Input
                id="profile-name"
                autoFocus
                maxLength={50}
                required
                value={value}
                onChange={(event) => setDraft(event.target.value)}
              />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" disabled={!value.trim()}>
                Save name
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setDraft(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-lg font-semibold">{name}</span>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit name
            </Button>
          </div>
        )}
      </fieldset>
    </SettingsSection>
  );
}
