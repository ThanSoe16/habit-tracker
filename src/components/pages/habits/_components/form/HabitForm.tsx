import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HabitColorSelector } from "./HabitColorSelector";
import { Controller } from "react-hook-form";
import { HabitIconSelector } from "./HabitIconSelector";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";
import { TabToggle } from "./TabToggle";
import { WeekdaySelector } from "./WeekdaySelector";
import { MonthlyDaySelector } from "./MonthlyDaySelector";
import { SpecificDateSelector } from "./SpecificDateSelector";
import { Switch } from "@/components/ui/switch";
import { HabitEndCondition } from "./HabitEndCondition";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const HabitForm = ({ form, isEdit }: { form: any; isEdit?: boolean }) => {
  const router = useRouter();
  const {
    formState: { errors },
    watch,
  } = form;

  const selectedColor = watch("color");
  const habitName = watch("name");
  const frequencyTab = watch("frequencyTab");
  const allDay = watch("allDay");
  const reminders = watch("reminders");
  const type = watch("type");

  return (
    <div className="flex flex-col p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {isEdit ? "Edit Habit" : "Create Habit"}
        </h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <FieldGroup className="space-y-6">
        <Field data-invalid={!!errors.type}>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <TabToggle
                value={field.value}
                setValue={field.onChange}
                options={[
                  { value: "habit", label: "Regular Habit" },
                  { value: "task", label: "One-Time Task" },
                ]}
              />
            )}
          />
        </Field>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="form-name">Habit Name</FieldLabel>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <Input
                id="form-name"
                type="text"
                placeholder="Evil Rabbit"
                isError={!!errors.name}
                {...field}
              />
            )}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.emoji}>
          <FieldLabel htmlFor="form-icon">Icon</FieldLabel>
          <Controller
            name="emoji"
            control={form.control}
            render={({ field }) => (
              <HabitIconSelector
                value={field.value}
                setValue={field.onChange}
                selectedColor={selectedColor}
                habitName={habitName}
              />
            )}
          />
          <FieldError errors={[errors.emoji]} />
        </Field>

        <Field data-invalid={!!errors.color}>
          <FieldLabel htmlFor="form-color">Color</FieldLabel>
          <Controller
            name="color"
            control={form.control}
            render={({ field }) => (
              <HabitColorSelector
                value={field.value}
                setValue={field.onChange}
              />
            )}
          />
          <FieldError errors={[errors.color]} />
        </Field>

        <Field data-invalid={!!errors.startDate}>
          <FieldLabel htmlFor="form-startDate">
            {type === "task" ? "Date" : "Start Date"}
          </FieldLabel>
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                date={field.value ? parseISO(field.value) : undefined}
                onChange={(newDate) => {
                  if (newDate) {
                    field.onChange(format(newDate, "yyyy-MM-dd"));
                  }
                }}
              />
            )}
          />
          <FieldError errors={[errors.startDate]} />
        </Field>

        {type !== "task" && (
          <div className="space-y-4">
            <Field data-invalid={!!errors.frequencyTab}>
              <FieldLabel htmlFor="form-frequencyTab">Repeat</FieldLabel>
              <Controller
                name="frequencyTab"
                control={form.control}
                render={({ field }) => (
                  <TabToggle
                    value={field.value}
                    setValue={field.onChange}
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "monthly", label: "Monthly" },
                      { value: "specific", label: "Specific Dates" },
                    ]}
                  />
                )}
              />
            </Field>

            {frequencyTab === "daily" && (
              <Field data-invalid={!!errors.selectedDays}>
                <Controller
                  name="selectedDays"
                  control={form.control}
                  render={({ field }) => (
                    <WeekdaySelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError errors={[errors.selectedDays]} />
              </Field>
            )}

            {frequencyTab === "monthly" && (
              <Field data-invalid={!!errors.selectedMonthlyDays}>
                <Controller
                  name="selectedMonthlyDays"
                  control={form.control}
                  render={({ field }) => (
                    <MonthlyDaySelector
                      value={field.value}
                      onChange={field.onChange}
                      selectedColor={selectedColor}
                    />
                  )}
                />
                <FieldError errors={[errors.selectedMonthlyDays]} />
              </Field>
            )}

            {frequencyTab === "specific" && (
              <Field data-invalid={!!errors.selectedSpecificDates}>
                <Controller
                  name="selectedSpecificDates"
                  control={form.control}
                  render={({ field }) => (
                    <SpecificDateSelector
                      value={field.value}
                      onChange={field.onChange}
                      selectedColor={selectedColor}
                    />
                  )}
                />
                <FieldError errors={[errors.selectedSpecificDates]} />
              </Field>
            )}
          </div>
        )}

        <div className="space-y-4 pt-2 border-t border-gray-100">
          <Field
            orientation="horizontal"
            className="flex items-center justify-between"
          >
            <FieldLabel className="mb-0 cursor-pointer" htmlFor="form-allDay">
              All Day
            </FieldLabel>
            <Controller
              name="allDay"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="form-allDay"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </Field>

          {!allDay && (
            <Field data-invalid={!!errors.timeOfDay}>
              <Controller
                name="timeOfDay"
                control={form.control}
                render={({ field }) => (
                  <TabToggle
                    value={field.value}
                    setValue={field.onChange}
                    options={[
                      { value: "morning", label: "Morning" },
                      { value: "afternoon", label: "Afternoon" },
                      { value: "evening", label: "Evening" },
                    ]}
                  />
                )}
              />
              <FieldError errors={[errors.timeOfDay]} />
            </Field>
          )}
        </div>

        {type !== "task" && <HabitEndCondition form={form} />}

        <div className="space-y-4 pt-2 border-t border-gray-100">
          <Field
            orientation="horizontal"
            className="flex items-center justify-between"
          >
            <FieldLabel
              className="mb-0 cursor-pointer"
              htmlFor="form-reminders"
            >
              Reminders
            </FieldLabel>
            <Controller
              name="reminders"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="form-reminders"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </Field>

          {reminders && (
            <Field data-invalid={!!errors.reminderTime}>
              <Controller
                name="reminderTime"
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="time"
                    className="h-12 rounded-xl border-transparent shadow-sm"
                    {...field}
                  />
                )}
              />
              <FieldError errors={[errors.reminderTime]} />
            </Field>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl border-gray-200 text-gray-500 font-bold"
            onClick={() => {
              form.reset();
              router.back();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="h-12 rounded-xl shadow-lg font-bold">
            {isEdit ? "Update Habit" : "Create Habit"}
          </Button>
        </div>
      </FieldGroup>
    </div>
  );
};

export default HabitForm;
