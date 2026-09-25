import { z } from 'zod';

export const goalStatusSchema = z.enum(['idea', 'planning', 'in_progress', 'completed']);
export const goalCurrencySchema = z.enum(['USDT', 'THB', 'MMK', 'SGD']);

export type GoalStatus = z.infer<typeof goalStatusSchema>;
export type GoalCurrency = z.infer<typeof goalCurrencySchema>;

export type GoalSubIdea = {
  id: string;
  text: string;
  isDone: boolean;
  createdAt: string;
};

export type GoalSavingEntry = {
  id: string;
  amount: number;
  note: string;
  savedAt: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  why: string;
  targetDate: string;
  targetAmount: number | null;
  currency: GoalCurrency;
  savings: GoalSavingEntry[];
  places: string[];
  subIdeas: GoalSubIdea[];
  status: GoalStatus;
  completionNote: string;
  energyScore: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const goalDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give this goal a name.')
    .max(120, 'Use 120 characters or fewer.'),
  why: z.string().trim().max(500, 'Use 500 characters or fewer.').optional().default(''),
  targetDate: z.string().trim().optional().default(''),
  targetAmountText: z
    .string()
    .trim()
    .regex(/^\d*\.?\d*$/, 'Use a valid amount.')
    .optional()
    .default(''),
  currency: goalCurrencySchema.default('USDT'),
  placesText: z.string().trim().max(500, 'Use 500 characters or fewer.').optional().default(''),
  subIdeasText: z.string().trim().max(1000, 'Use 1000 characters or fewer.').optional().default(''),
});

export const createGoalSchema = goalDetailsSchema;

export type CreateGoalValues = z.infer<typeof createGoalSchema>;

export const editGoalSchema = goalDetailsSchema.omit({ subIdeasText: true });

export type EditGoalValues = z.infer<typeof editGoalSchema>;

export const goalSavingSchema = z.object({
  amountText: z
    .string()
    .trim()
    .min(1, 'Enter an amount.')
    .regex(/^\d*\.?\d*$/, 'Use a valid amount.'),
  note: z.string().trim().max(160, 'Use 160 characters or fewer.').optional().default(''),
  savedAt: z.string().trim().optional().default(''),
});

export type GoalSavingValues = z.infer<typeof goalSavingSchema>;

export const completeGoalSchema = z.object({
  completionNote: z
    .string()
    .trim()
    .min(1, 'Write a short completion note.')
    .max(800, 'Use 800 characters or fewer.'),
  energyScore: z.coerce.number().int().min(1).max(5),
});

export type CompleteGoalValues = z.infer<typeof completeGoalSchema>;

export const goalSettingsSchema = z.object({
  showCompletedOnHome: z.boolean(),
});

export type GoalSettings = z.infer<typeof goalSettingsSchema>;
