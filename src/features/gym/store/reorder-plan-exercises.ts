import type { PlanDay, WorkoutLog } from './model';

export function reorderPlanExercises(
  weeklyPlan: PlanDay[],
  history: Record<string, WorkoutLog>,
  dayIndex: number,
  activeId: string,
  overId: string,
) {
  const day = weeklyPlan.find((candidate) => candidate.dayIndex === dayIndex);
  if (!day || day.isRestDay || activeId === overId) return null;
  const from = day.exercises.findIndex((exercise) => exercise.id === activeId);
  const to = day.exercises.findIndex((exercise) => exercise.id === overId);
  if (from < 0 || to < 0) return null;

  const exercises = [...day.exercises];
  exercises.splice(to, 0, exercises.splice(from, 1)[0]);
  const ranks = new Map(exercises.map((exercise, index) => [exercise.id, index]));
  const nextHistory = { ...history };
  for (const [date, log] of Object.entries(history)) {
    if (log.completed || log.dayIndex !== dayIndex) continue;
    // Move the existing log objects; retain completed sets, weights, and per-set details.
    nextHistory[date] = {
      ...log,
      exercises: [...log.exercises].sort(
        (a, b) => (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity),
      ),
    };
  }

  return {
    weeklyPlan: weeklyPlan.map((candidate) =>
      candidate === day ? { ...day, exercises } : candidate,
    ),
    history: nextHistory,
  };
}
