"use client";
import { useForm } from "react-hook-form";
import HabitForm from "../_components/form/HabitForm";
import { HabitData, habitSchema } from "@/features/habits/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { COLORS, EMOJIS } from "@/features/habits/data";

const CreateHabitPage = () => {
  const form = useForm<HabitData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      color: COLORS[0],
      emoji: EMOJIS[0],
      startDate: new Date().toISOString().split("T")[0],
      type: "habit",
      frequencyTab: "daily",
      selectedDays: [1, 2, 3, 4, 5, 6, 0],
      selectedMonthlyDays: [],
      selectedSpecificDates: [],
      allDay: true,
      timeOfDay: "morning",
      endHabitEnabled: true,
      endHabitMode: "date",
      endHabitDate: "2026-12-31",
      endHabitDays: 365,
      reminders: false,
      reminderTime: "07:00 AM",
    },
  });

  console.log(form.formState.errors);

  const onSubmit = (data: HabitData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <HabitForm form={form} />
    </form>
  );
};

export default CreateHabitPage;
