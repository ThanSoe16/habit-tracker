export type UsageRange = 'today' | '7-days' | '30-days';
export type AppCategory =
  | 'Social'
  | 'Entertainment'
  | 'Productivity'
  | 'Games'
  | 'Education'
  | 'Other';

export interface AppUsage {
  id: string;
  appName: string;
  appIdentifier: string;
  icon: string;
  iconUrl?: string | null;
  category: AppCategory;
  durationSeconds: number;
  percentage: number;
  openCount: number;
  notifications: number;
}

export interface DailyUsage {
  date: string;
  screenTimeSeconds: number;
  focusTimeSeconds: number;
  pickups: number;
  notifications: number;
  lateNightUsageSeconds: number;
  appLimitViolations: number;
}

export interface AppLimit {
  id: string;
  appIdentifier: string;
  appName: string;
  icon: string;
  dailyLimitSeconds: number;
  usedTodaySeconds: number;
  warningBeforeSeconds: number;
  enabled: boolean;
}

export type FocusSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export interface FocusHistoryItem {
  id: string;
  startedAt: string;
  durationSeconds: number;
  status: FocusSessionStatus;
  apps: string[];
}

export type ChallengeStatus = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export interface WellbeingChallenge {
  id: string;
  enrollmentId?: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
}

export type InsightSeverity = 'positive' | 'neutral' | 'warning';
export interface WellbeingInsight {
  id: string;
  title: string;
  message: string;
  severity: InsightSeverity;
  period: 'weekly' | 'monthly';
}

export interface WellbeingScoreInput {
  screenTimeSeconds: number;
  screenTimeGoalSeconds: number;
  focusTimeSeconds: number;
  focusGoalSeconds: number;
  appLimitViolations: number;
  lateNightUsageSeconds: number;
  pickups: number;
  pickupGoal: number;
  improvementPercent: number;
}
