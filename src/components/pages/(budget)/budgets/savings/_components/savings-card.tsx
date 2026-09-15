'use client';
import { Flex } from '@radix-ui/themes';
import { LockKeyhole, LockKeyholeOpen, Plus, History } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/features/budget/store/model';
import { isSavingsUnlocked, type SavingsGoal } from '@/features/savings/types';

export function SavingsCard({
  goal,
  now,
  onAction,
}: {
  goal: SavingsGoal;
  now: Date;
  onAction: (kind: 'deposit' | 'withdrawal' | 'history') => void;
}) {
  const unlocked = isSavingsUnlocked(goal, now);
  const progress = goal.target_amount
    ? Math.min(100, (goal.balance / goal.target_amount) * 100)
    : 0;
  const conditions = [
    goal.target_amount
      ? `${formatCurrency(goal.target_amount, goal.currency)} target${goal.target_reached_at ? ' (reached)' : ''}`
      : null,
    goal.unlock_date ? `${goal.unlock_date} (UTC)` : null,
  ].filter(Boolean);
  return (
    <Card className="rounded-3xl py-5 shadow-sm">
      <CardHeader className="gap-2 px-5">
        <Flex className="flex items-start justify-between gap-2">
          <CardTitle className="min-w-0 break-words font-extrabold">{goal.name}</CardTitle>
          <Badge className="shrink-0 rounded-full" variant={unlocked ? 'default' : 'secondary'}>
            {unlocked ? <LockKeyholeOpen /> : <LockKeyhole />}
            {unlocked ? 'Available' : 'Locked'}
          </Badge>
        </Flex>
        <CardDescription className="text-xs leading-relaxed">
          {conditions.join(goal.unlock_rule === 'both' ? ' AND ' : ' OR ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        <Flex className="flex flex-col gap-3">
          <p className="text-3xl font-black tracking-tight tabular-nums break-words">
            {formatCurrency(goal.balance, goal.currency)}
          </p>
          {goal.target_amount !== null && (
            <>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`${goal.name} savings progress`}
                aria-valuenow={progress}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% of target currently saved
                {goal.target_reached_at ? ' · Target reached' : ''}
              </p>
            </>
          )}
          {goal.note && <p className="text-sm text-muted-foreground break-words">{goal.note}</p>}
          {!unlocked && (
            <p className="text-xs text-muted-foreground">
              Withdrawals unlock when{' '}
              {goal.unlock_rule === 'both' && conditions.length === 2
                ? 'both conditions are'
                : 'a condition is'}{' '}
              met.
            </p>
          )}
        </Flex>
      </CardContent>
      <CardFooter className="rounded-b-3xl px-5 py-4">
        <Flex className="flex flex-wrap w-full gap-2">
          <Button size="lg" className="flex-1 rounded-full" onClick={() => onAction('deposit')}>
            <Plus data-icon="inline-start" />
            Add money
          </Button>
          <Button
            size="lg"
            className="flex-1 rounded-full"
            variant="outline"
            disabled={!unlocked || goal.balance === 0}
            onClick={() => onAction('withdrawal')}
          >
            Withdraw
          </Button>
          <Button
            size="lg"
            className="rounded-full"
            variant="ghost"
            onClick={() => onAction('history')}
          >
            <History data-icon="inline-start" />
            History
          </Button>
        </Flex>
      </CardFooter>
    </Card>
  );
}
