'use client';

import { PiggyBank, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import type { Goal } from '@/features/goals/types';
import { cn } from '@/utils/cn';
import { GoalCard } from './goal-card';

type GoalDetailDrawerProps = {
  goal: Goal | null;
  tone?: string;
  onOpenChange: (open: boolean) => void;
};

export function GoalDetailDrawer({
  goal,
  tone = 'goal-tone-blue',
  onOpenChange,
}: GoalDetailDrawerProps) {
  const updateGoalDetails = useGoalsStore((state) => state.updateGoalDetails);
  const addSaving = useGoalsStore((state) => state.addSaving);
  const addSubIdea = useGoalsStore((state) => state.addSubIdea);
  const toggleSubIdea = useGoalsStore((state) => state.toggleSubIdea);
  const completeGoal = useGoalsStore((state) => state.completeGoal);
  const reopenGoal = useGoalsStore((state) => state.reopenGoal);
  const deleteGoal = useGoalsStore((state) => state.deleteGoal);
  const updateStatus = useGoalsStore((state) => state.updateStatus);

  return (
    <Drawer open={Boolean(goal)} onOpenChange={onOpenChange}>
      <DrawerContent className={cn('mx-auto w-full max-w-lg overflow-hidden bg-card', tone)}>
        <DrawerHeader className="!flex-row items-start gap-3 px-5 pb-4 pt-5 !text-left">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <DrawerTitle className="break-words text-lg font-bold leading-tight">
              {goal?.title ?? 'Goal details'}
            </DrawerTitle>
            <DrawerDescription className="mt-1 line-clamp-2 text-xs">
              {goal?.why || 'Your wish, one step at a time.'}
            </DrawerDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-full"
            aria-label="Close goal details"
            onClick={() => onOpenChange(false)}
          >
            <X />
          </Button>
        </DrawerHeader>
        <div data-vaul-no-drag className="min-h-0 overflow-y-auto px-5 pb-8">
          {goal && (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddSubIdea={addSubIdea}
              onToggleSubIdea={toggleSubIdea}
              onComplete={completeGoal}
              onReopen={reopenGoal}
              onDelete={(goalId) => {
                deleteGoal(goalId);
                onOpenChange(false);
              }}
              onUpdateDetails={updateGoalDetails}
              onAddSaving={addSaving}
              onStatusChange={updateStatus}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
