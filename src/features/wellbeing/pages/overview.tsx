'use client';

import Link from 'next/link';
import { Bell, Crosshair, Footprints, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppUsageList } from '../components/app-usage-list';
import { InsightCard } from '../components/insight-card';
import { MetricCard } from '../components/metric-card';
import { ScreenTimeCard } from '../components/screen-time-card';
import { WellbeingScoreCard } from '../components/wellbeing-score-card';
import { calculateWellbeingScore } from '../domain/calculate-wellbeing-score';
import { generateWellbeingInsights } from '../domain/generate-wellbeing-insights';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { formatDuration } from '../utils/format-duration';

const SCREEN_TIME_GOAL = 5 * 3600;
const FOCUS_GOAL = 2 * 3600;
const PICKUP_GOAL = 60;

export default function WellbeingOverviewPage() {
  const { dailyUsage, appUsage, todayAppUsage, insights: storedInsights, settings, isLoading, error } = useWellbeingData(14);
  const todayKey = new Date().toLocaleDateString('en-CA');
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const today = dailyUsage.find((day) => day.date === todayKey) ?? { date: todayKey, screenTimeSeconds: 0, focusTimeSeconds: 0, pickups: 0, notifications: 0, lateNightUsageSeconds: 0, appLimitViolations: 0 };
  const yesterday = dailyUsage.find((day) => day.date === yesterdayDate.toLocaleDateString('en-CA'));
  const changePercent = yesterday?.screenTimeSeconds
    ? Math.round(((today.screenTimeSeconds - yesterday.screenTimeSeconds) / yesterday.screenTimeSeconds) * 100)
    : 0;
  const screenTimeGoal = settings?.daily_screen_time_goal_seconds ?? SCREEN_TIME_GOAL;
  const focusGoal = settings?.daily_focus_goal_seconds ?? FOCUS_GOAL;
  const pickupGoal = settings?.daily_pickup_goal ?? PICKUP_GOAL;
  const score = calculateWellbeingScore({
    screenTimeSeconds: today.screenTimeSeconds,
    screenTimeGoalSeconds: screenTimeGoal,
    focusTimeSeconds: today.focusTimeSeconds,
    focusGoalSeconds: focusGoal,
    appLimitViolations: today.appLimitViolations,
    lateNightUsageSeconds: today.lateNightUsageSeconds,
    pickups: today.pickups,
    pickupGoal,
    improvementPercent: Math.max(0, -changePercent),
  });
  const current = dailyUsage.slice(-7);
  const previous = dailyUsage.slice(-14, -7);
  const insights = storedInsights.length ? storedInsights : (dailyUsage.length ? generateWellbeingInsights({ current, previous, apps: appUsage }) : []);

  if (isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;

  return (
    <div className="flex flex-col gap-5">
      <ScreenTimeCard seconds={today.screenTimeSeconds} goalSeconds={screenTimeGoal} changePercent={changePercent} />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Screen Time" value={formatDuration(today.screenTimeSeconds)} icon={Smartphone} />
        <MetricCard label="Focus Time" value={formatDuration(today.focusTimeSeconds)} icon={Crosshair} />
        <MetricCard label="Phone Pickups" value={String(today.pickups)} icon={Footprints} />
        <MetricCard label="Notifications" value={String(today.notifications)} icon={Bell} />
      </div>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader>
          <CardTitle>Daily Goal</CardTitle>
          <CardDescription>{formatDuration(today.screenTimeSeconds)} of {formatDuration(screenTimeGoal)}</CardDescription>
        </CardHeader>
        <CardContent><Progress value={(today.screenTimeSeconds / screenTimeGoal) * 100} /></CardContent>
        <CardFooter>
          <Button asChild className="w-full rounded-xl"><Link href="/digital-wellbeing/focus">Start Focus Mode</Link></Button>
        </CardFooter>
      </Card>

      <WellbeingScoreCard score={score} />

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader>
          <CardTitle>Most Used Apps</CardTitle>
          <CardDescription>Where your screen time went today</CardDescription>
        </CardHeader>
        <CardContent><AppUsageList apps={todayAppUsage} limit={5} /></CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full"><Link href="/digital-wellbeing/app-usage">View All</Link></Button>
        </CardFooter>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold">Recent Insights</h2>
          <Button asChild variant="link" size="sm"><Link href="/digital-wellbeing/insights">View all</Link></Button>
        </div>
        {insights.slice(0, 2).map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        {!insights.length && <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Insights will appear after usage is recorded.</CardContent></Card>}
      </section>
    </div>
  );
}
