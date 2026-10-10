import { parseTimeTakenToSeconds, formatTimeTakenDisplay } from '@/utils/time-utils';

// History always stores completed time, regardless of the timer's direction.
export function getInitialTimerSeconds(
  timeTaken: string | undefined,
  goalSeconds: number,
  isCountDown: boolean,
): number {
  const completedSeconds = Math.max(0, parseTimeTakenToSeconds(timeTaken));
  return isCountDown ? Math.max(0, goalSeconds - completedSeconds) : completedSeconds;
}

export function getTimerProgress(seconds: number, goalSeconds: number, isCountDown: boolean) {
  const completedSeconds = Math.max(0, isCountDown ? goalSeconds - seconds : seconds);
  const remainingSeconds = Math.max(0, goalSeconds - completedSeconds);
  return {
    completedSeconds,
    remainingSeconds,
    timeTaken: formatTimeTakenDisplay(completedSeconds),
    completed: remainingSeconds === 0,
    percent: Math.min(100, (completedSeconds / (goalSeconds || 1)) * 100),
  };
}

export function formatRemainingTimerTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `+${hours} hr, ${minutes} min, ${remainder} sec`
    : `+${minutes} min, ${remainder} sec`;
}

export function advanceHabitTimer(seconds: number, goalSeconds: number, isCountDown: boolean) {
  const nextSeconds = isCountDown ? Math.max(0, seconds - 1) : seconds + 1;
  const reachedGoal = isCountDown
    ? seconds > 0 && nextSeconds === 0
    : seconds < goalSeconds && nextSeconds >= goalSeconds;
  return { seconds: nextSeconds, reachedGoal };
}
