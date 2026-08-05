'use client';
import HabitEditForm from './_components/habit-edit-form';
import { useHabitStore } from '@/store/use-habit-store';

const EditHabit = ({ id }: { id: string }) => {
  const { habits } = useHabitStore();
  const habit = habits.find((h) => h.id === id);
  return <>{habit && <HabitEditForm habit={habit} />}</>;
};

export default EditHabit;
