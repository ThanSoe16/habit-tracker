import type { PlanDay, WorkoutLog } from './model';

export const syncUncompletedLogsWithPlan = (
  weeklyPlan: PlanDay[],
  history: Record<string, WorkoutLog>,
) => {
  const newHistory = { ...history };
  Object.keys(newHistory).forEach((dateStr) => {
    const log = newHistory[dateStr];
    if (log && !log.completed) {
      const planDay = weeklyPlan[log.dayIndex];
      if (planDay) {
        newHistory[dateStr] = {
          ...log,
          dayTitle: planDay.title,
          exercises: planDay.exercises.map((ex) => {
            const existingEx = log.exercises.find(
              (e) => e.id === ex.id || e.exerciseId === ex.exerciseId,
            );
            return {
              id: ex.id,
              exerciseId: ex.exerciseId,
              name: ex.name,
              category: ex.category,
              targetSets: ex.targetSets,
              completedSets: existingEx ? Math.min(existingEx.completedSets, ex.targetSets) : 0,
              targetReps: ex.targetReps,
              weight: ex.weight,
              completed: existingEx ? existingEx.completed : false,
            };
          }),
        };
      }
    }
  });
  return newHistory;
};
