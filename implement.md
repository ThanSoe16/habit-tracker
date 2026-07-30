# Implementation Plan

## 1. State Management (`useHabitStore.ts`)

- Update `Habit` interface to include:
  - `unitType: 'simple' | 'time' | 'count'`
  - `goalValue: number`
- Update `addHabit` and `updateHabit` signatures to accept and store these new properties.

## 2. Forms (`HabitForm.tsx`)

- Add a new UI section for **Goal / Unit**.
- Add form state handling for `unitType` and `goalValue`.
- Update `WeekdaySelector.tsx` to include presets ("Every Day", "Weekdays", "Weekends") for faster selection.

## 3. Cards (`HabitCard.tsx`)

- Read the new `goalValue` and `unitType`.
- Display a progress text (e.g., `2/5` times) or a progress mini-bar if `unitType !== 'simple'`.
- Add a quick `+` button to increment the count/time directly from the card.
- Add a quick check button to complete instantly.

## 4. Drawers (`HabitCompletionDrawer.tsx`)

- Remove the 'Time' vs 'Count' tabs.
- Render a specific input view based on `habit.unitType`.
- Provide quick add presets (e.g., +5 mins, +15 mins if time-based).

## 5. Filter Design (`HabitList` or Parent)

- Add a visual Filter Component (e.g., horizontal pill tabs `All | Pending | Completed`).
- Pass the filter state to the rendering logic so only the matching cards are shown.
