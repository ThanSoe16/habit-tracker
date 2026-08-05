'use client';

import { DailyWorkoutView } from './_components/daily-workout-view';

export default function GymPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950">
      <DailyWorkoutView />
    </div>
  );
}
