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

const HabitForm = ({ form }: { form: any }) => {
  const {
    formState: { errors },
    watch,
  } = form;

  const selectedColor = watch("color");
  const habitName = watch("name");

  return (
    <div className="flex flex-col p-6">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
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
          <FieldLabel htmlFor="form-startDate">Start Date</FieldLabel>
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
          <FieldError errors={[errors.color]} />
        </Field>
        <Field orientation="horizontal">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </Field>
      </FieldGroup>
    </div>
  );
};

export default HabitForm;
