'use client';

import { Clock3 } from 'lucide-react';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import type { Goal } from '@/features/goals/types';
import { GoalCard } from './_components/goal-card';

function sortCompletedGoals(goals: Goal[]) {
  return [...goals]
    .filter((goal) => goal.status === 'completed')
    .sort((a, b) => {
      const first = a.completedAt ?? a.updatedAt;
      const second = b.completedAt ?? b.updatedAt;
      return new Date(second).getTime() - new Date(first).getTime();
    });
}

export default function GoalsHistoryPage() {
  const goals = useGoalsStore((state) => state.goals);
  const addSaving = useGoalsStore((state) => state.addSaving);
  const addSubIdea = useGoalsStore((state) => state.addSubIdea);
  const toggleSubIdea = useGoalsStore((state) => state.toggleSubIdea);
  const completeGoal = useGoalsStore((state) => state.completeGoal);
  const reopenGoal = useGoalsStore((state) => state.reopenGoal);
  const deleteGoal = useGoalsStore((state) => state.deleteGoal);
  const updateGoalDetails = useGoalsStore((state) => state.updateGoalDetails);
  const updateStatus = useGoalsStore((state) => state.updateStatus);
  const completedGoals = sortCompletedGoals(goals);

  return (
    <section className="flex flex-col gap-3">
      <div className="px-1">
        <p className="text-sm font-bold text-muted-foreground">
          {completedGoals.length} completed goals
        </p>
      </div>

      {completedGoals.length > 0 ? (
        <div className="flex flex-col gap-3">
          {completedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddSubIdea={addSubIdea}
              onToggleSubIdea={toggleSubIdea}
              onComplete={completeGoal}
              onReopen={reopenGoal}
              onDelete={deleteGoal}
              onUpdateDetails={updateGoalDetails}
              onAddSaving={addSaving}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-xs">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <Clock3 className="size-9 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-foreground">No history yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Completed goals will appear here.</p>
          </div>
        </div>
      )}
    </section>
  );
}
