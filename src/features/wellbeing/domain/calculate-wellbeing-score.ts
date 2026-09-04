import type { WellbeingScoreInput } from '../types';

function ratioScore(actual: number, goal: number, weight: number, lowerIsBetter: boolean) {
  if (goal <= 0) return weight;
  const ratio = actual / goal;
  const normalized = lowerIsBetter ? Math.min(1, 1 / Math.max(1, ratio)) : Math.min(1, ratio);
  return normalized * weight;
}

export function calculateWellbeingScore(input: WellbeingScoreInput) {
  const screenTime = ratioScore(input.screenTimeSeconds, input.screenTimeGoalSeconds, 30, true);
  const focus = ratioScore(input.focusTimeSeconds, input.focusGoalSeconds, 25, false);
  const pickups = ratioScore(input.pickups, input.pickupGoal, 15, true);
  const limitDiscipline = Math.max(0, 15 - input.appLimitViolations * 3);
  const lateNight = Math.max(0, 10 - (input.lateNightUsageSeconds / 3600) * 10);
  const improvement = Math.max(0, Math.min(5, input.improvementPercent / 4));
  return Math.round(Math.max(0, Math.min(100, screenTime + focus + pickups + limitDiscipline + lateNight + improvement)));
}

export function getWellbeingLevel(score: number) {
  if (score < 40) return 'Needs Attention';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Good';
  return 'Healthy';
}
