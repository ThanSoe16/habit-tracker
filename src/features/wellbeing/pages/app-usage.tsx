'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Clock3, Layers3, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <ToggleGroup type="single" value={range} onValueChange={(value) => value && setRange(value as UsageRange)} variant="outline" className="grid grid-cols-3">
        <ToggleGroupItem value="today">Today</ToggleGroupItem>
        <ToggleGroupItem value="7-days">7 days</ToggleGroupItem>
        <ToggleGroupItem value="30-days">30 days</ToggleGroupItem>
      </ToggleGroup>

      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Total" value={formatDuration(total)} icon={Smartphone} />
        <MetricCard label="Daily Avg" value={formatDuration(total / days)} icon={Clock3} />
        <MetricCard label="Top App" value={appUsage[0]?.appName ?? '—'} icon={Layers3} />
      </div>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Usage Trend</CardTitle><CardDescription>Daily screen time over the last week</CardDescription></CardHeader>
        <CardContent><UsageChart data={chartData} /></CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Usage by Category</CardTitle><CardDescription>Share of total app usage</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {categories.map(([category, percentage]) => (
            <div key={category}>
              <div className="mb-2 flex justify-between text-xs"><span>{category}</span><span className="font-bold">{percentage}%</span></div>
              <Progress value={percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Individual Apps</CardTitle><CardDescription>Usage, opens, and notification activity</CardDescription></CardHeader>
        <CardContent><AppUsageList apps={appUsage} /></CardContent>
      </Card>
    </div>
  );
}
