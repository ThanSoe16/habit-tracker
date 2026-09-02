import { addDays, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

export function calculateHabitEndDate(startDate: string, durationDays: number): string {
  const start = parseISO(startDate);
  if (!isValid(start) || !Number.isFinite(durationDays) || durationDays < 1) return '';

  // The start date is day 1, so a 365-day habit ends 364 calendar days later.
  return format(addDays(start, Math.floor(durationDays) - 1), 'yyyy-MM-dd');
}

export function calculateHabitDurationDays(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isValid(start) || !isValid(end)) return 0;

  return differenceInCalendarDays(end, start) + 1;
}
