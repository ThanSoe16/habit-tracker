'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Clock3, DatabaseZap, Layers3, Smartphone } from 'lucide-react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AppUsageList } from '../components/app-usage-list';
import { MetricCard } from '../components/metric-card';
import { UsageChart } from '../components/usage-chart';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import type { AppCategory, UsageRange } from '../types';
import { formatDuration } from '../utils/format-duration';

export default function AppUsagePage() {
  const [range, setRange] = useState<UsageRange>('today');
  const days = range === 'today' ? 1 : range === '7-days' ? 7 : 30;
  const { dailyUsage, appUsage, isLoading, error } = useWellbeingData(days);
  const total = appUsage.reduce((sum, app) => sum + app.durationSeconds, 0);
  const recordedDays = Math.max(1, dailyUsage.length);
  const hasUsage = dailyUsage.length > 0 || appUsage.length > 0;
  const rangeDescription = range === 'today' ? 'today' : range === '7-days' ? 'the last 7 days' : 'the last 30 days';
  const chartData = dailyUsage.map((day) => ({ label: format(parseISO(day.date), 'EEE'), minutes: Math.round(day.screenTimeSeconds / 60) }));
  const categories = useMemo(() => {
    const result = new Map<AppCategory, number>();
    appUsage.forEach((app) => result.set(app.category, (result.get(app.category) ?? 0) + app.percentage));
    return [...result.entries()].sort((a, b) => b[1] - a[1]);
  }, [appUsage]);

  if (isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;

  return (
    <div className="flex flex-col gap-5">
      <ToggleGroup type="single" value={range} onValueChange={(value) => value && setRange(value as UsageRange)} className="grid w-full grid-cols-3 rounded-2xl bg-muted p-1" spacing={1}>
        <ToggleGroupItem value="today" className="w-full rounded-xl data-[state=on]:bg-card data-[state=on]:shadow-sm">Today</ToggleGroupItem>
        <ToggleGroupItem value="7-days" className="w-full rounded-xl data-[state=on]:bg-card data-[state=on]:shadow-sm">7 days</ToggleGroupItem>
        <ToggleGroupItem value="30-days" className="w-full rounded-xl data-[state=on]:bg-card data-[state=on]:shadow-sm">30 days</ToggleGroupItem>
      </ToggleGroup>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Total" value={formatDuration(total)} detail={rangeDescription} icon={Smartphone} />
        <MetricCard label="Daily Avg" value={formatDuration(total / recordedDays)} detail={`${dailyUsage.length} recorded ${dailyUsage.length === 1 ? 'day' : 'days'}`} icon={Clock3} />
        <MetricCard label="Top App" value={appUsage[0]?.appName ?? 'No app yet'} detail={appUsage[0] ? `${appUsage[0].percentage}% of total usage` : 'Waiting for usage data'} icon={Layers3} className="col-span-2" />
      </div>

      {!hasUsage && (
        <Card className="rounded-[2rem] bg-gradient-to-br from-card to-primary/5 shadow-sm">
          <CardHeader>
            <CardTitle>No app activity yet</CardTitle>
            <CardDescription>There is no usage recorded for {rangeDescription}.</CardDescription>
            <CardAction><span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><DatabaseZap /></span></CardAction>
          </CardHeader>
          <CardContent><p className="text-sm leading-relaxed text-muted-foreground">Choose a wider date range, or wait until app activity has synced from Supabase.</p></CardContent>
        </Card>
      )}

      {dailyUsage.length > 0 && (
        <Card className="rounded-[2rem] shadow-sm">
          <CardHeader><CardTitle>Usage Trend</CardTitle><CardDescription>Daily screen time for {rangeDescription}</CardDescription></CardHeader>
          <CardContent><UsageChart data={chartData} /></CardContent>
        </Card>
      )}

      {categories.length > 0 && (
        <Card className="rounded-[2rem] shadow-sm">
          <CardHeader><CardTitle>Usage by Category</CardTitle><CardDescription>Share of total app usage</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {categories.map(([category, percentage]) => (
              <div key={category} className="rounded-2xl bg-muted/40 p-3">
                <div className="mb-2 flex justify-between text-xs"><span className="font-semibold">{category}</span><span className="font-bold">{percentage}%</span></div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {appUsage.length > 0 && (
        <Card className="rounded-[2rem] shadow-sm">
          <CardHeader><CardTitle>Individual Apps</CardTitle><CardDescription>Usage, opens, and notification activity</CardDescription></CardHeader>
          <CardContent><AppUsageList apps={appUsage} /></CardContent>
        </Card>
      )}
    </div>
  );
}
