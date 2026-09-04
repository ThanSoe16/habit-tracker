/** Schema-derived Supabase types for the Digital Wellbeing migration. */

export type AppCategory =
  | 'SOCIAL'
  | 'ENTERTAINMENT'
  | 'PRODUCTIVITY'
  | 'GAMES'
  | 'EDUCATION'
  | 'COMMUNICATION'
  | 'FINANCE'
  | 'HEALTH'
  | 'SHOPPING'
  | 'OTHER';

export type FocusSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type ChallengeType =
  | 'SCREEN_TIME_LIMIT'
  | 'APP_USAGE_LIMIT'
  | 'FOCUS_TIME'
  | 'FOCUS_SESSION_COUNT'
  | 'NO_LATE_NIGHT_USAGE'
  | 'REDUCE_APP_USAGE'
  | 'PICKUP_LIMIT'
  | 'CUSTOM';
export type ChallengeTargetUnit = 'SECONDS' | 'COUNT' | 'PERCENT';
export type UserChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type InsightType =
  | 'SCREEN_TIME'
  | 'FOCUS'
  | 'APP_USAGE'
  | 'LATE_NIGHT_USAGE'
  | 'PICKUPS'
  | 'NOTIFICATIONS'
  | 'GOAL'
  | 'WELLBEING_SCORE';
export type InsightSeverity = 'POSITIVE' | 'NEUTRAL' | 'WARNING';

export interface DigitalWellbeingDailyUsageRow {
  id: string;
  user_id: string;
  usage_date: string;
  screen_time_seconds: number;
  focus_time_seconds: number;
  pickup_count: number;
  notification_count: number;
  late_night_usage_seconds: number;
  app_limit_violations: number;
  wellbeing_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingAppUsageRow {
  id: string;
  user_id: string;
  usage_date: string;
  app_identifier: string;
  app_name: string;
  app_icon_url: string | null;
  category: AppCategory | null;
  usage_seconds: number;
  open_count: number;
  notification_count: number;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingAppLimitRow {
  id: string;
  user_id: string;
  app_identifier: string;
  app_name: string;
  daily_limit_seconds: number;
  warning_before_seconds: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingFocusSessionRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  planned_duration_seconds: number;
  completed_duration_seconds: number;
  status: FocusSessionStatus;
  pause_count: number;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingFocusSessionAppRow {
  id: string;
  focus_session_id: string;
  app_identifier: string;
  app_name: string;
  created_at: string;
}

export interface DigitalWellbeingBedtimeSettingsRow {
  id: string;
  user_id: string;
  bedtime: string | null;
  wake_time: string | null;
  active_days: number[];
  bedtime_reminder_enabled: boolean;
  reduce_notifications: boolean;
  reduce_distracting_apps: boolean;
  grayscale_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingChallengeRow {
  id: string;
  title: string;
  description: string | null;
  challenge_type: ChallengeType;
  target_value: number | null;
  target_unit: ChallengeTargetUnit | null;
  duration_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingUserChallengeRow {
  id: string;
  user_id: string;
  challenge_id: string;
  started_at: string;
  ended_at: string | null;
  current_value: number;
  target_value: number;
  status: UserChallengeStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingSettingsRow {
  id: string;
  user_id: string;
  daily_screen_time_goal_seconds: number | null;
  daily_focus_goal_seconds: number | null;
  daily_pickup_goal: number | null;
  screen_time_warning_enabled: boolean;
  excessive_usage_warning_enabled: boolean;
  app_limit_warning_enabled: boolean;
  default_focus_duration_seconds: number;
  focus_notifications_enabled: boolean;
  allow_emergency_focus_break: boolean;
  daily_summary_enabled: boolean;
  weekly_report_enabled: boolean;
  monthly_report_enabled: boolean;
  data_retention_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface DigitalWellbeingInsightRow {
  id: string;
  user_id: string;
  insight_date: string;
  insight_type: InsightType;
  title: string;
  message: string;
  value: number | null;
  previous_value: number | null;
  change_percent: number | null;
  severity: InsightSeverity;
  is_read: boolean;
  created_at: string;
}

type GeneratedColumns = 'id' | 'created_at' | 'updated_at';
type InsertShape<Row, Optional extends keyof Row> = Omit<Row, Optional> & Partial<Pick<Row, Optional>>;
type UpdateShape<Row> = Partial<Omit<Row, 'id' | 'user_id' | 'created_at'>>;

export type DigitalWellbeingDailyUsageInsert = InsertShape<
  DigitalWellbeingDailyUsageRow,
  GeneratedColumns | 'screen_time_seconds' | 'focus_time_seconds' | 'pickup_count' |
    'notification_count' | 'late_night_usage_seconds' | 'app_limit_violations' | 'wellbeing_score'
>;
export type DigitalWellbeingDailyUsageUpdate = UpdateShape<DigitalWellbeingDailyUsageRow>;

export type DigitalWellbeingAppUsageInsert = InsertShape<
  DigitalWellbeingAppUsageRow,
  GeneratedColumns | 'app_icon_url' | 'category' | 'usage_seconds' | 'open_count' | 'notification_count'
>;
export type DigitalWellbeingAppUsageUpdate = UpdateShape<DigitalWellbeingAppUsageRow>;

export type DigitalWellbeingAppLimitInsert = InsertShape<
  DigitalWellbeingAppLimitRow,
  GeneratedColumns | 'warning_before_seconds' | 'is_enabled'
>;
export type DigitalWellbeingAppLimitUpdate = UpdateShape<DigitalWellbeingAppLimitRow>;

export type DigitalWellbeingFocusSessionInsert = InsertShape<
  DigitalWellbeingFocusSessionRow,
  GeneratedColumns | 'ended_at' | 'completed_duration_seconds' | 'pause_count'
>;
export type DigitalWellbeingFocusSessionUpdate = UpdateShape<DigitalWellbeingFocusSessionRow>;

export type DigitalWellbeingFocusSessionAppInsert = InsertShape<
  DigitalWellbeingFocusSessionAppRow,
  'id' | 'created_at'
>;
export type DigitalWellbeingFocusSessionAppUpdate = Partial<
  Pick<DigitalWellbeingFocusSessionAppRow, 'app_identifier' | 'app_name'>
>;

export type DigitalWellbeingBedtimeSettingsInsert = InsertShape<
  DigitalWellbeingBedtimeSettingsRow,
  GeneratedColumns | 'bedtime' | 'wake_time' | 'active_days' | 'bedtime_reminder_enabled' |
    'reduce_notifications' | 'reduce_distracting_apps' | 'grayscale_enabled'
>;
export type DigitalWellbeingBedtimeSettingsUpdate = UpdateShape<DigitalWellbeingBedtimeSettingsRow>;

export type DigitalWellbeingChallengeInsert = InsertShape<
  DigitalWellbeingChallengeRow,
  GeneratedColumns | 'description' | 'target_value' | 'target_unit' | 'duration_days' | 'is_active'
>;
export type DigitalWellbeingChallengeUpdate = Partial<Omit<DigitalWellbeingChallengeRow, GeneratedColumns>>;

export type DigitalWellbeingUserChallengeInsert = InsertShape<
  DigitalWellbeingUserChallengeRow,
  GeneratedColumns | 'started_at' | 'ended_at' | 'current_value' | 'status' | 'completed_at'
>;
export type DigitalWellbeingUserChallengeUpdate = UpdateShape<DigitalWellbeingUserChallengeRow>;

export type DigitalWellbeingSettingsInsert = InsertShape<
  DigitalWellbeingSettingsRow,
  GeneratedColumns | 'daily_screen_time_goal_seconds' | 'daily_focus_goal_seconds' |
    'daily_pickup_goal' | 'screen_time_warning_enabled' | 'excessive_usage_warning_enabled' |
    'app_limit_warning_enabled' | 'default_focus_duration_seconds' | 'focus_notifications_enabled' |
    'allow_emergency_focus_break' | 'daily_summary_enabled' | 'weekly_report_enabled' |
    'monthly_report_enabled' | 'data_retention_days'
>;
export type DigitalWellbeingSettingsUpdate = UpdateShape<DigitalWellbeingSettingsRow>;

export type DigitalWellbeingInsightInsert = InsertShape<
  DigitalWellbeingInsightRow,
  'id' | 'value' | 'previous_value' | 'change_percent' | 'severity' | 'is_read' | 'created_at'
>;
export type DigitalWellbeingInsightUpdate = Partial<
  Omit<DigitalWellbeingInsightRow, 'id' | 'user_id' | 'created_at'>
>;

export interface DigitalWellbeingTables {
  digital_wellbeing_daily_usage: DigitalWellbeingDailyUsageRow;
  digital_wellbeing_app_usage: DigitalWellbeingAppUsageRow;
  digital_wellbeing_app_limits: DigitalWellbeingAppLimitRow;
  digital_wellbeing_focus_sessions: DigitalWellbeingFocusSessionRow;
  digital_wellbeing_focus_session_apps: DigitalWellbeingFocusSessionAppRow;
  digital_wellbeing_bedtime_settings: DigitalWellbeingBedtimeSettingsRow;
  digital_wellbeing_challenges: DigitalWellbeingChallengeRow;
  digital_wellbeing_user_challenges: DigitalWellbeingUserChallengeRow;
  digital_wellbeing_settings: DigitalWellbeingSettingsRow;
  digital_wellbeing_insights: DigitalWellbeingInsightRow;
}
