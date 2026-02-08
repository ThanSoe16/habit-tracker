/**
 * Returns a date string in YYYY-MM-DD format based on local time.
 */
export function getLocalDateString(date: Date = new Date()): string {
  // Use en-CA as it's the most reliable locale for YYYY-MM-DD
  return date.toLocaleDateString("en-CA");
}

/**
 * Checks if a habit should be done on a given date based on its repeat days.
 */
export function isHabitRequiredOnDate(
  repeatDays: number[] | undefined,
  date: Date,
): boolean {
  // If repeatDays is undefined (legacy), assume daily
  if (repeatDays === undefined) return true;
  // If repeatDays is empty, it's a one-off habit. This logic might need refinement
  // depending on how one-off habits are handled, but for streak purposes,
  // one-offs usually don't have "streaks" in the traditional sense.
  if (repeatDays.length === 0) return false;

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return repeatDays.includes(dayOfWeek);
}
