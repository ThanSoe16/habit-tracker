'use client';

import Link from 'next/link';
import { ChevronRight, CircleDot, Flag, MapPin, PiggyBank, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatCurrency } from '@/features/budget/store/model';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import type { Goal, GoalStatus } from '@/features/goals/types';
import { cn } from '@/utils/cn';
import { GoalDetailDrawer } from './_components/goal-detail-drawer';
import { goalTones } from './_components/goal-tones';

const statusLabels: Record<GoalStatus, string> = {
  idea: 'Idea',
  planning: 'Planning',
  in_progress: 'In progress',
  completed: 'Completed',
};

function sortActiveGoals(goals: Goal[]) {
  return [...goals]
    .filter((goal) => goal.status !== 'completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export default function GoalsManagePage() {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const handledHash = useRef(false);
  const goals = useGoalsStore((state) => state.goals);
  const activeGoals = sortActiveGoals(goals);
  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? null;

  useEffect(() => {
    if (handledHash.current) return;
    const targetId = window.location.hash.slice(1);
    if (!targetId.startsWith('goal-')) {
      handledHash.current = true;
      return;
    }
    const goalId = targetId.slice(5);
    if (!goals.some((goal) => goal.id === goalId)) return;

    const frame = requestAnimationFrame(() => {
      handledHash.current = true;
      setSelectedGoalId(goalId);
    });
    return () => cancelAnimationFrame(frame);
  }, [goals]);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between px-1 py-1">
        <SidebarTrigger className="size-10 rounded-full border border-border bg-card text-foreground shadow-xs" />
        <h1 className="text-lg font-bold text-foreground">Goal List</h1>
        <span className="size-10" aria-hidden="true" />
      </header>

      <section className="flex flex-col gap-3" aria-label="Active goals">
        {activeGoals.length > 0 ? (
          activeGoals.map((goal, index) => {
            const Icon = goal.targetAmount ? PiggyBank : goal.places.length > 0 ? MapPin : Flag;
            const isSelected = selectedGoalId === goal.id;

            return (
              <div
                key={goal.id}
                id={`goal-${goal.id}`}
                className={cn('scroll-mt-4', goalTones[index % goalTones.length])}
              >
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={cn(
                    'flex min-h-20 w-full items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    isSelected && 'border-primary/40',
                  )}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold text-foreground">
                      {goal.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CircleDot className="size-3 shrink-0 text-primary" aria-hidden="true" />
                      <span className="truncate">
                        {statusLabels[goal.status]}
                        {goal.targetAmount
                          ? ` · Target ${formatCurrency(goal.targetAmount, goal.currency)}`
                          : ''}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Flag className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">No active goals</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start with one goal that matters.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-lg justify-end px-6">
        <Button
          asChild
          size="icon-lg"
          className="pointer-events-auto size-14 rounded-full border-2 border-background shadow-lg"
        >
          <Link href="/goals/create" aria-label="Create goal" title="Create goal">
            <Plus className="size-7" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>
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
