'use client';

import { useHabitReport } from '@/features/habits/services/list-queries';
import { Target, Flame, CheckCircle2 } from 'lucide-react';
import { Flex, Grid } from '@radix-ui/themes';

export function QuickStats() {
  const { habits } = useHabitReport();

  const totalHabits = habits.length;

  const currentStreak = habits.length > 0 ? Math.max(0, ...habits.map((h) => h.streak)) : 0;

  const totalCompletions = habits.reduce((acc, h) => {
    return (
      acc +
      Object.values(h.history).filter((entry) => {
        return typeof entry === 'boolean' ? entry : entry?.completed;
      }).length
    );
  }, 0);

  const stats = [
    {
      icon: Target,
      value: totalHabits,
      label: 'Total Habits',
    },
    {
      icon: Flame,
      value: `${currentStreak}d`,
      label: 'Best Streak',
    },
    {
      icon: CheckCircle2,
      value: totalCompletions,
      label: 'Completed',
    },
  ];

  return (
    <Grid columns="3" gap="3" aria-label="Habit overview">
      {stats.map((stat) => (
        <Flex
          key={stat.label}
          direction="column"
          align="center"
          gap="2"
          className="min-w-0 rounded-2xl p-3 border border-border bg-card"
        >
          <Flex
            align="center"
            justify="center"
            aria-hidden="true"
            className="size-9 rounded-xl bg-primary/10 text-primary"
          >
            <stat.icon className="size-4" />
          </Flex>
          <p className="text-lg font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground text-center">{stat.label}</p>
        </Flex>
      ))}
    </Grid>
  );
}
