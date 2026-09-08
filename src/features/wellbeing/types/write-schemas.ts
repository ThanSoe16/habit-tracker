import { z } from 'zod';

export const appLimitSchema = z.object({
  app_identifier: z.string().trim().min(1),
  app_name: z.string().trim().min(1),
  daily_limit_seconds: z.number().int().positive(),
  warning_before_seconds: z.number().int().nonnegative(),
  is_enabled: z.boolean(),
});

export const wellbeingSettingsSchema = z
  .object({
    daily_screen_time_goal_seconds: z.number().int().positive().nullable(),
    daily_focus_goal_seconds: z.number().int().nonnegative().nullable(),
    daily_pickup_goal: z.number().int().nonnegative().nullable(),
    screen_time_warning_enabled: z.boolean(),
    excessive_usage_warning_enabled: z.boolean(),
    app_limit_warning_enabled: z.boolean(),
    default_focus_duration_seconds: z.number().int().positive(),
    focus_notifications_enabled: z.boolean(),
    allow_emergency_focus_break: z.boolean(),
    daily_summary_enabled: z.boolean(),
    weekly_report_enabled: z.boolean(),
    monthly_report_enabled: z.boolean(),
    data_retention_days: z.number().int().positive().nullable(),
  })
  .partial();

export const bedtimeSettingsSchema = z
  .object({
    bedtime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
      .nullable(),
    wake_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
      .nullable(),
    active_days: z.array(z.number().int().min(1).max(7)),
    bedtime_reminder_enabled: z.boolean(),
    reduce_notifications: z.boolean(),
    reduce_distracting_apps: z.boolean(),
    grayscale_enabled: z.boolean(),
  })
  .partial();

export const focusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
  plannedDurationSeconds: z.number().int().positive(),
  completedDurationSeconds: z.number().int().nonnegative(),
  pauseCount: z.number().int().nonnegative(),
  endedAt: z.string().datetime({ offset: true }).nullable().optional(),
});
