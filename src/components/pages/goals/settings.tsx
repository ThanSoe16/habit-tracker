'use client';

import { History, House, Trash2 } from 'lucide-react';
import { SettingsContent } from '@/components/shared/settings/settings-content';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import {
  AppSettingsLink,
  SettingsSaveStatus,
  SettingsSection,
  SettingsSwitch,
} from '@/components/settings/settings-controls';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import { isNativeApp } from '@/lib/native/runtime';

export default function GoalsSettingsPage() {
  const [clearOpen, setClearOpen] = useState(false);
  const settings = useGoalsStore((state) => state.settings);
  const goals = useGoalsStore((state) => state.goals);
  const updateSettings = useGoalsStore((state) => state.updateSettings);
  const clearCompletedGoals = useGoalsStore((state) => state.clearCompletedGoals);
  const completedCount = goals.filter((goal) => goal.status === 'completed').length;

  return (
    <SettingsContent>
      <SettingsSaveStatus scope="goals" />
      <SettingsSection
        title="Home"
        icon={House}
        description="Personalize what appears on your Goals home page."
      >
        <SettingsSwitch
          label="Show latest completed goal"
          description="Display the most recent completion note on the Goals home page."
          checked={settings.showCompletedOnHome}
          onCheckedChange={(showCompletedOnHome) => updateSettings({ showCompletedOnHome })}
        />
      </SettingsSection>

      <SettingsSection
        title="History"
        icon={History}
        description={`${completedCount} completed goals are stored on this device.`}
      >
        <Button
          type="button"
          variant="destructive"
          disabled={completedCount === 0}
          onClick={() => setClearOpen(true)}
        >
          <Trash2 data-icon="inline-start" />
          Clear completed goals
        </Button>
      </SettingsSection>

      {!isNativeApp && <AppSettingsLink />}

      <ConfirmationDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear completed goals?"
        desc="This removes completed goals from history. Active goals stay unchanged."
        confirmText="Clear history"
        onPress={() => {
          clearCompletedGoals();
          setClearOpen(false);
        }}
      />
    </SettingsContent>
  );
}
