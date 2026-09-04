import type { AppUsage, DailyUsage, WellbeingInsight } from '../types';
import { formatDuration } from '../utils/format-duration';

interface InsightInput {
  current: DailyUsage[];
  previous: DailyUsage[];
  apps: AppUsage[];
}

const average = (values: number[]) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;

export function generateWellbeingInsights({ current, previous, apps }: InsightInput): WellbeingInsight[] {
  const currentScreen = average(current.map((day) => day.screenTimeSeconds));
  const previousScreen = average(previous.map((day) => day.screenTimeSeconds));
  const difference = currentScreen - previousScreen;
  const lateNight = current.reduce((total, day) => total + day.lateNightUsageSeconds, 0);
  const focus = current.reduce((total, day) => total + day.focusTimeSeconds, 0);
  const topApp = [...apps].sort((a, b) => b.durationSeconds - a.durationSeconds)[0];

  return [
    {
      id: 'screen-time-change',
      title: difference <= 0 ? 'Screen time improved' : 'Screen time increased',
      message: difference <= 0
        ? `You spent ${formatDuration(Math.abs(difference))} less on your phone per day this week.`
        : `Your daily screen time increased by ${formatDuration(difference)} this week.`,
      severity: difference <= 0 ? 'positive' : 'warning',
      period: 'weekly',
    },
    {
      id: 'focus-total',
      title: 'Focused time',
      message: `You protected ${formatDuration(focus)} for focused work during the last seven days.`,
      severity: focus >= 4 * 3600 ? 'positive' : 'neutral',
      period: 'weekly',
    },
    {
      id: 'top-app',
      title: 'Most distracting app',
      message: topApp
        ? `${topApp.appName} made up ${topApp.percentage}% of your screen time.`
        : 'No app usage has been recorded yet.',
      severity: (topApp?.percentage ?? 0) > 30 ? 'warning' : 'neutral',
      period: 'weekly',
    },
    {
      id: 'late-night',
      title: 'Late-night usage',
      message: `${formatDuration(lateNight)} of usage happened during your bedtime window.`,
      severity: lateNight > 2 * 3600 ? 'warning' : 'positive',
      period: 'monthly',
    },
  ];
}
