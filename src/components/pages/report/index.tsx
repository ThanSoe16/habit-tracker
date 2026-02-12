'use client';

import { ReportHeader } from './_components/ReportHeader';
import { StatsCards } from './_components/StatsCards';
import { HabitsCompletedChart } from './_components/HabitsCompletedChart';
import { CompletionRateChart } from './_components/CompletionRateChart';
import { CalendarStats } from './_components/CalendarStats';
import { MoodChart } from './_components/MoodChart';

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto p-4 pb-24 space-y-5">
        <ReportHeader />
        <StatsCards />
        <HabitsCompletedChart />
        <CompletionRateChart />
        <CalendarStats />
        <MoodChart />
      </div>
    </div>
  );
}
