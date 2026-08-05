/**
 * Returns a date string in YYYY-MM-DD format based on local time.
 */
export function getLocalDateString(date: Date = new Date()): string {
  // Use en-CA as it's the most reliable locale for YYYY-MM-DD
  return date.toLocaleDateString('en-CA');
}

/**
 * Checks if a habit should be done on a given date.
 */
export function isHabitRequiredOnDate(
  habit: {
    frequency?: string;
    repeatDays?: number[];
    specificDates?: string[];
    startDate?: string;
    createdAt?: string;
    type?: 'habit' | 'task';
  },
  date: Date,
): boolean {
  const dateStr = getLocalDateString(date);

  // One-time tasks
  if (habit.type === 'task') {
    const targetDate =
      habit.startDate ||
      (habit.createdAt
        ? new Date(habit.createdAt).toLocaleDateString('en-CA')
        : getLocalDateString());
    return dateStr === targetDate;
  }

  // Specific dates mode
  if (habit.frequency === 'specific') {
    return habit.specificDates?.includes(dateStr) || false;
  }

  // Monthly mode (usually repeatDays contains day of month numbers)
  if (habit.frequency === 'monthly' && habit.repeatDays) {
    const dayOfMonth = date.getDate();
    return habit.repeatDays.includes(dayOfMonth);
  }

  // Legacy/Default/Weekly frequency (repeatDays contains day of week numbers)
  if (habit.repeatDays === undefined) return true;
  if (habit.repeatDays.length === 0) {
    // One-off habit: only show on its startDate (or createdAt if startDate missing)
    const targetDate =
      habit.startDate ||
      (habit.createdAt
        ? new Date(habit.createdAt).toLocaleDateString('en-CA')
        : getLocalDateString());
    return dateStr === targetDate;
  }

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return habit.repeatDays.includes(dayOfWeek);
}
