'use client';
import { useState } from 'react';
import { Dumbbell, Timer } from 'lucide-react';
import { SettingsContent } from '@/components/shared/settings/settings-content';
import { SettingsAction } from '@/components/shared/settings/settings-action';
import { useGymStore } from '@/store/use-gym-store';
import {
  AppSettingsLink,
  SettingsChoice,
  SettingsLoading,
  SettingsSaveStatus,
  SettingsSection,
  SettingsSwitch,
} from '@/components/settings/settings-controls';
import { RestTimerModal } from './_components/rest-timer-modal';

export default function GymSettingsPage() {
  const { gymSettings: settings, updateGymSettings: update, isLoaded } = useGymStore();
  const [timerOpen, setTimerOpen] = useState(false);
  const seconds = settings.restTimerSeconds ?? 180;
  return (
    <SettingsContent>
      <SettingsSaveStatus scope="workout" />
      {isLoaded ? (
        <>
          <SettingsSection
            title="Workout defaults"
            icon={Dumbbell}
            description="Set your preferred units and defaults for training."
          >
            <SettingsChoice
              label="Weight unit"
              description="Changes the displayed unit label; existing entered weights are not converted."
              value={settings.weightUnit}
              onChange={(weightUnit) => update({ weightUnit })}
              options={[
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'lbs', label: 'Pounds (lbs)' },
              ]}
            />
            <SettingsChoice
              label="Default sets"
              description="Used when adding exercises without a set count."
              value={String(settings.defaultTargetSets)}
              onChange={(value) => update({ defaultTargetSets: Number(value) })}
              options={[3, 4, 5].map((value) => ({ value: String(value), label: `${value} sets` }))}
            />
            <SettingsAction
              label="Rest timer"
              description={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} between sets`}
              icon={Timer}
              onClick={() => setTimerOpen(true)}
            />
            <SettingsSwitch
              label="Category badges"
              description="Show muscle-group labels on workout exercises."
              checked={settings.showCategoryBadges}
              onCheckedChange={(showCategoryBadges) => update({ showCategoryBadges })}
            />
          </SettingsSection>
          {timerOpen && (
            <RestTimerModal
              isOpen
              onClose={() => setTimerOpen(false)}
              initialSeconds={seconds}
              onSave={(restTimerSeconds) => update({ restTimerSeconds })}
            />
          )}
        </>
      ) : (
        <SettingsLoading />
      )}
      <AppSettingsLink />
    </SettingsContent>
  );
}
