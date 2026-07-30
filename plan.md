# Plan for Habit Tracker UI Improvements

## 1. Home Page Habit Cards & Filter

- **Habit Cards design**:
  - Add a "progress" indicator (e.g., text showing `current / goal` or a mini progress bar).
  - Add quick action icons directly on the card: an "Add" (+) icon for quick incremental updates (useful for 'count' units) and a "Finish" (Check) icon to instantly complete the habit.
- **Filter Design**:
  - Implement a visual filter component on the home page (e.g., pill tabs or a dropdown) to filter habits by status (All, Pending, Completed) or type.

## 2. Finish Drawer (Habit Progress)

- **Dynamic Unit-based UI**: currently, the drawer hardcodes tabs for "Time Taken" and "Count". We will update the drawer to read the habit's associated `unitType` and only display the corresponding input (e.g., if it's a time-based habit, only show the time input; if simple, just a confirmation).
- **Polished UI**: Refine the design elements to make the drawer more intuitive and visually appealing.

## 3. Habit Units Section (Create/Edit Form)

- **Enhance the Model**: Add `unitType` (e.g., 'time', 'count', 'simple') and `goalValue` (number) to the `Habit` type in the global store.
- **Form UI**: Add a dedicated "Unit" or "Goal" section in `HabitForm.tsx`. This section will allow users to select how they measure the habit and set a specific target (e.g., "30" limits for "mins", "5" for "times").

## 4. Repeat Days Improvements

- **Refined Selection**: Update the `WeekdaySelector.tsx` and surrounding logic to offer preselcted groups like "Every Day", "Weekdays", "Weekends", alongside the custom day selection, improving user experience and matching modern tracker apps.
