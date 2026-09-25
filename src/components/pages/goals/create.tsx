'use client';

import { useRouter } from 'next/navigation';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import { CreateGoalForm } from './_components/create-goal-form';

export default function GoalsCreatePage() {
  const router = useRouter();
  const addGoal = useGoalsStore((state) => state.addGoal);

  return (
    <CreateGoalForm
      onCreate={addGoal}
      onCreated={() => router.push('/goals/manage')}
      onCancel={() => router.push('/goals/manage')}
    />
  );
}
