'use client';

import { useState } from 'react';
import { Bell, Crosshair, Footprints, Smartphone } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { InsightCard } from '../components/insight-card';
import { MetricCard } from '../components/metric-card';
import { generateWellbeingInsights } from '../domain/generate-wellbeing-insights';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration } from '../utils/format-duration';

export default function InsightsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const days = period === 'weekly' ? 7 : 30;
  const { dailyUsage, appUsage, insights: storedInsights, isLoading, error } = useWellbeingData(days * 2);
  const current = dailyUsage.slice(-days);
  const previous = dailyUsage.slice(-days * 2, -days);
  const insights = storedInsights.length ? storedInsights : (current.length ? generateWellbeingInsights({ current, previous, apps: appUsage }) : []);
  const averageScreen = current.length ? current.reduce((sum, day) => sum + day.screenTimeSeconds, 0) / current.length : 0;
  const averagePickups = current.length ? Math.round(current.reduce((sum, day) => sum + day.pickups, 0) / current.length) : 0;
  const averageNotifications = current.length ? Math.round(current.reduce((sum, day) => sum + day.notifications, 0) / current.length) : 0;
  const focus = current.reduce((sum, day) => sum + day.focusTimeSeconds, 0);

  if (isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;

  return (
    <div className="flex flex-col gap-5">
      <ToggleGroup type="single" value={period} onValueChange={(value) => value && setPeriod(value as 'weekly' | 'monthly')} variant="outline" className="grid grid-cols-2">
        <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem><ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
      </ToggleGroup>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Average Screen" value={formatDuration(averageScreen)} icon={Smartphone} />
        <MetricCard label="Focus Time" value={formatDuration(focus)} icon={Crosshair} />
        <MetricCard label="Pickup Average" value={String(averagePickups)} icon={Footprints} />
        <MetricCard label="Notification Avg" value={String(averageNotifications)} icon={Bell} />
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="px-1 text-sm font-bold">Meaningful Insights</h2>
        {insights.filter((insight) => insight.period === period || period === 'monthly').map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        {!insights.length && <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Insights will appear after usage is recorded.</CardContent></Card>}
      </section>
    </div>
  );
}
