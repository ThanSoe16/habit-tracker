"use client";
import HabitEditForm from "./_components/HabitEditForm";
import { useHabitStore, Habit } from "@/store/useHabitStore";

const EditHabit = ({ id }: { id: string }) => {
  const { habits } = useHabitStore();
  const habit = habits.find((h) => h.id === id);
  return <>{habit && <HabitEditForm habit={habit} />}</>;
};

export default EditHabit;
