'use client';
import { useUserStore } from '@/store/use-user-store';
import { SettingsChoice, SettingsSwitch } from './settings-controls';

export function HabitPreferences() {
  const { homeSettings: settings, updateHomeSettings: update } = useUserStore();
  return (
    <>
      <SettingsChoice
        label="Startup view"
        description="Used when opening the habit home page."
        value={settings.homeDefaultView}
        onChange={(homeDefaultView) => update({ homeDefaultView })}
        options={[
          { value: 'today', label: 'Today' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'overall', label: 'Overall' },
        ]}
      />
      <SettingsChoice
        label="Card layout"
        value={settings.cardStyle}
        onChange={(cardStyle) => update({ cardStyle })}
        options={[
          { value: 'detailed', label: 'Detailed' },
          { value: 'compact', label: 'Compact' },
        ]}
      />
      <SettingsChoice
        label="Sort habits"
        value={settings.sortBy}
        onChange={(sortBy) => update({ sortBy })}
        options={[
          { value: 'manual', label: 'Manual' },
          { value: 'timeOfDay', label: 'Time of day' },
          { value: 'status', label: 'Pending first' },
          { value: 'streak', label: 'Top streak' },
          { value: 'alphabetical', label: 'A–Z' },
        ]}
      />
      <SettingsSwitch
        label="Group by time of day"
        description="Separate morning, afternoon, and evening habits."
        checked={settings.groupByTimeOfDay}
        onCheckedChange={(groupByTimeOfDay) => update({ groupByTimeOfDay })}
      />
      <SettingsSwitch
        label="Hide completed habits"
        description="Show only pending habits in the daily view."
        checked={settings.hideCompleted}
        onCheckedChange={(hideCompleted) => update({ hideCompleted })}
      />
      <SettingsSwitch
        label="Progress summary"
        checked={settings.showProgressBanner}
        onCheckedChange={(showProgressBanner) => update({ showProgressBanner })}
      />
      <SettingsSwitch
        label="Streak badges"
        checked={settings.showStreakBadges}
        onCheckedChange={(showStreakBadges) => update({ showStreakBadges })}
      />
    </>
  );
}
