"use client";
import { useForm } from "react-hook-form";
import HabitForm from "../_components/form/HabitForm";
import { HabitData, habitSchema } from "@/features/habits/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { COLORS, EMOJIS } from "@/features/habits/data";
import { useHabitStore } from "@/store/useHabitStore";
import { useRouter } from "next/navigation";

const CreateHabitPage = () => {
  const router = useRouter();
  const addHabit = useHabitStore((state) => state.addHabit);

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

  const onSubmit = (data: HabitData) => {
    addHabit(
      data.name,
      data.color,
      data.frequencyTab,
      data.frequencyTab === "daily"
        ? data.selectedDays
        : data.frequencyTab === "monthly"
          ? data.selectedMonthlyDays
          : [],
      data.emoji,
      data.startDate,
      undefined, // endDate is not used directly in this form version
      data.type,
      data.allDay ? undefined : data.timeOfDay,
      data.reminders ? data.reminderTime : undefined,
      data.endHabitEnabled && data.endHabitMode === "date"
        ? data.endHabitDate
        : undefined,
      data.endHabitEnabled && data.endHabitMode === "days"
        ? data.endHabitDays
        : undefined,
      data.frequencyTab === "specific" ? data.selectedSpecificDates : [],
    );
    router.back();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <HabitForm form={form} />
    </form>
  );
};

export default CreateHabitPage;
