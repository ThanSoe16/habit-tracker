# architectural and UX differences (Before vs After)

## 1. Data Model (`useHabitStore.ts`)

- **Before**: The `Habit` type did not strictly define a measurable goal. The history just kept track of optional `timeTaken` and `count` fields for any habit.
- **After**: The `Habit` type will include `unitType` (`'boolean' | 'time' | 'count'`) and `goalValue` (`number`). This allows the app to know exactly how a habit is measured and when it's considered "fully" completed.

## 2. Create/Edit Habit Form

- **Before**: Form had frequency tabs and color pickers. Repeat days were a simple row of 7 day buttons.
- **After**:
  - **New Unit Section**: Users explicitly choose if the habit is Yes/No, Time-based, or Count-based, and specify the daily goal.
  - **Upgraded Repeat Days**: Provides quick presets (Every Day, Weekdays) alongside individual circle toggles, providing a clearer and faster configuration process.

## 3. Home Page & Habit Cards

- **Before**: Habit cards showed basic info, streak, and a single status circle. The drawer had to be opened to log any detailed metrics.
- **After**:
  - Cards become interactive tracking surfaces. They display current progress vs the goal (e.g., `2/5 water glasses`).
  - Quick action buttons (`+` and `✓`) allow users to log progress without opening the drawer every time.
  - A new filter component helps declutter the view if the user has many habits.

## 4. Habit Completion Drawer

- **Before**: Always presented a two-tab interface (Time vs Count), cluttering the UI when only one metric applied.
- **After**: Context-aware. It instantly presents the correct input stepper or number field based on the habit's `unitType`, drastically reducing friction.
