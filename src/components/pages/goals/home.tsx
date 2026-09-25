'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, CircleDot, PiggyBank, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/features/budget/store/model';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import type { Goal, GoalStatus } from '@/features/goals/types';
import { cn } from '@/utils/cn';
import { GoalDetailDrawer } from './_components/goal-detail-drawer';
import { goalTones } from './_components/goal-tones';

const statusLabels: Record<GoalStatus, string> = {
  idea: 'Idea',
  planning: 'Planning',
  in_progress: 'In Progress',
  completed: 'Completed',
};

function WishCard({
  goal,
  index,
  onOpen,
}: {
  goal: Goal;
  index: number;
  onOpen: (goalId: string) => void;
}) {
  const saved = goal.savings.reduce((total, saving) => total + saving.amount, 0);
  const target = goal.targetAmount;
  const stepsDone = goal.subIdeas.filter((step) => step.isDone).length;
  const hasTarget = target !== null && target > 0;
  const progress = hasTarget
    ? (saved / target) * 100
    : goal.subIdeas.length > 0
      ? (stepsDone / goal.subIdeas.length) * 100
      : 0;
  const displayProgress = Math.max(0, Math.min(100, progress));

  return (
    <button
      type="button"
      onClick={() => onOpen(goal.id)}
      className="block w-full rounded-2xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label={`Open ${goal.title} details`}
    >
      <Card
        className={cn(
          'gap-4 rounded-2xl border-0 bg-card py-5 shadow-sm ring-0 transition-shadow hover:shadow-md',
          goalTones[index % goalTones.length],
        )}
      >
        <CardHeader className="!flex flex-row items-start gap-3 px-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-bold text-card-foreground">
              {goal.title}
            </CardTitle>
            <CardDescription className="mt-1 truncate text-xs">
              {hasTarget ? `Target ${formatCurrency(target, goal.currency)}` : 'No money target'}
            </CardDescription>
          </div>
          <Badge className="gap-1 bg-primary/10 px-2 text-[11px] font-semibold text-primary">
            <CircleDot className="size-3" aria-hidden="true" />
            {statusLabels[goal.status]}
          </Badge>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 px-5">
          <Progress
            value={displayProgress}
            aria-label={`${goal.title} progress`}
            className="h-3 bg-muted/60 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:shadow-sm"
          />
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">
                {hasTarget ? 'Saved' : 'Steps done'}
              </p>
              <p className="truncate text-sm font-bold text-card-foreground">
                {hasTarget
                  ? formatCurrency(saved, goal.currency)
                  : `${stepsDone} of ${goal.subIdeas.length}`}
              </p>
            </div>
            <span className="shrink-0 text-base font-bold text-primary">
              {displayProgress.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

export default function GoalsHomePage() {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const goals = useGoalsStore((state) => state.goals);
  const showCompletedOnHome = useGoalsStore((state) => state.settings.showCompletedOnHome);
  const activeGoals = goals.filter((goal) => goal.status !== 'completed');
  const latestCompleted = goals.find((goal) => goal.status === 'completed');
  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? null;

  return (
    <div className="flex flex-col gap-4 pt-2">
      {activeGoals.length > 0 ? (
        <section className="flex flex-col gap-4" aria-label="Wishes">
          {activeGoals.map((goal, index) => (
            <WishCard key={goal.id} goal={goal} index={index} onOpen={setSelectedGoalId} />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-12 text-center shadow-sm">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="size-8" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">No wishes yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with a goal you would love to reach.
            </p>
          </div>
          <Button asChild>
            <Link href="/goals/create">
              <Plus data-icon="inline-start" />
              Create goal
            </Link>
          </Button>
        </section>
      )}
      {showCompletedOnHome && latestCompleted && (
        <section aria-label="Latest completed">
          <button
            type="button"
            onClick={() => setSelectedGoalId(latestCompleted.id)}
            className="block w-full rounded-2xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`Open ${latestCompleted.title} details`}
          >
            <Card className="gap-2 rounded-2xl border-0 bg-card shadow-sm ring-0 hover:shadow-md">
              <CardHeader className="!flex flex-row items-center gap-3 px-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base font-semibold">
                    {latestCompleted.title}
                  </CardTitle>
                  <CardDescription className="truncate text-xs">
                    {latestCompleted.completionNote || 'Completed'}
                  </CardDescription>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </CardHeader>
            </Card>
          </button>
        </section>
      )}
      <GoalDetailDrawer
        goal={selectedGoal}
        tone={
          goalTones[
            Math.max(
              0,
              activeGoals.findIndex((goal) => goal.id === selectedGoalId),
            ) % goalTones.length
          ]
        }
        onOpenChange={(open) => {
          if (!open) setSelectedGoalId(null);
        }}
      />
    </div>
  );
}
