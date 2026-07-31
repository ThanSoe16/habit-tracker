import { supabase } from './client';
import { Habit } from '@/store/useHabitStore';
import { MoodEntry } from '@/store/useMoodStore';
import { PlanDay, Exercise, WorkoutLog } from '@/store/useGymStore';

// Habit database record interface
export interface HabitRow {
  id: string;
  name: string;
  color: string;
  emoji?: string | null;
  frequency: string;
  repeat_days?: number[] | null;
  type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  time_of_day?: string | null;
  reminder_time?: string | null;
  end_habit_date?: string | null;
  end_habit_days?: number | null;
  specific_dates?: string[] | null;
  unit_type?: string | null;
  unit?: string | null;
  goal_value?: number | null;
  timer_mode?: string | null;
  time_unit?: string | null;
  history?: Record<string, any> | null;
  streak?: number | null;
  created_at?: string | null;
}

export const habitsService = {
  async fetchHabits(): Promise<Habit[]> {
    const { data, error } = await supabase.from('habits').select('*');
    if (error) {
      console.warn('Error fetching habits from Supabase:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map((row: HabitRow) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      emoji: row.emoji || undefined,
      frequency: (row.frequency || 'daily') as Habit['frequency'],
      repeatDays: row.repeat_days || [],
      type: (row.type || 'habit') as Habit['type'],
      startDate: row.start_date || undefined,
      endDate: row.end_date || undefined,
      timeOfDay: (row.time_of_day || undefined) as Habit['timeOfDay'],
      reminderTime: row.reminder_time || undefined,
      endHabitDate: row.end_habit_date || undefined,
      endHabitDays: row.end_habit_days || undefined,
      specificDates: row.specific_dates || undefined,
      unitType: (row.unit_type || 'simple') as Habit['unitType'],
      unit: row.unit || undefined,
      goalValue: row.goal_value || undefined,
      timerMode: (row.timer_mode || undefined) as Habit['timerMode'],
      timeUnit: (row.time_unit || undefined) as Habit['timeUnit'],
      history: row.history || {},
      streak: row.streak || 0,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  },

  async upsertHabit(habit: Habit): Promise<void> {
    const payload: HabitRow = {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      emoji: habit.emoji || null,
      frequency: habit.frequency,
      repeat_days: habit.repeatDays,
      type: habit.type || 'habit',
      start_date: habit.startDate || null,
      end_date: habit.endDate || null,
      time_of_day: habit.timeOfDay || null,
      reminder_time: habit.reminderTime || null,
      end_habit_date: habit.endHabitDate || null,
      end_habit_days: habit.endHabitDays || null,
      specific_dates: habit.specificDates || null,
      unit_type: habit.unitType || 'simple',
      unit: habit.unit || null,
      goal_value: habit.goalValue || null,
      timer_mode: habit.timerMode || null,
      time_unit: habit.timeUnit || null,
      history: habit.history,
      streak: habit.streak,
      created_at: habit.createdAt,
    };
    const { error } = await supabase.from('habits').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Error upserting habit to Supabase:', error.message);
    }
  },

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting habit from Supabase:', error.message);
    }
  },

  async fetchCustomUnits(): Promise<string[]> {
    const { data, error } = await supabase.from('custom_units').select('name');
    if (error) {
      console.warn('Error fetching custom units:', error.message);
      return [];
    }
    return data ? data.map((d) => d.name) : [];
  },

  async addCustomUnit(name: string): Promise<void> {
    const { error } = await supabase.from('custom_units').upsert({ name }, { onConflict: 'name' });
    if (error) console.warn('Error adding custom unit:', error.message);
  },

  async deleteCustomUnit(name: string): Promise<void> {
    const { error } = await supabase.from('custom_units').delete().eq('name', name);
    if (error) console.warn('Error deleting custom unit:', error.message);
  },
};

export const userService = {
  async fetchProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', 'default_user')
      .single();

    if (error) {
      console.warn('Error fetching user profile from Supabase:', error.message);
      return null;
    }
    return data;
  },

  async upsertProfile(profile: {
    name: string;
    avatarEmoji: string;
    joinedAt: string;
    remindersEnabled: boolean;
    dailyReminderTime: string;
    theme: 'light' | 'dark';
  }) {
    const payload = {
      id: 'default_user',
      name: profile.name,
      avatar_emoji: profile.avatarEmoji,
      joined_at: profile.joinedAt,
      reminders_enabled: profile.remindersEnabled,
      daily_reminder_time: profile.dailyReminderTime,
      theme: profile.theme,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'id' });
    if (error) console.warn('Error upserting user profile to Supabase:', error.message);
  },
};

export const moodService = {
  async fetchMoods(): Promise<Record<string, MoodEntry>> {
    const { data, error } = await supabase.from('mood_entries').select('*');
    if (error) {
      console.warn('Error fetching moods from Supabase:', error.message);
      return {};
    }
    const result: Record<string, MoodEntry> = {};
    if (data) {
      for (const row of data) {
        result[row.date_key] = {
          mood: row.mood,
          label: row.label,
          emoji: row.emoji,
          tag: row.tag || undefined,
          timestamp: row.timestamp || new Date().toISOString(),
        };
      }
    }
    return result;
  },

  async upsertMood(dateKey: string, entry: MoodEntry): Promise<void> {
    const payload = {
      date_key: dateKey,
      mood: entry.mood,
      label: entry.label,
      emoji: entry.emoji,
      tag: entry.tag || null,
      timestamp: entry.timestamp,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('mood_entries').upsert(payload, { onConflict: 'date_key' });
    if (error) console.warn('Error upserting mood entry to Supabase:', error.message);
  },
};

export const gymService = {
  async fetchGymPlans(): Promise<PlanDay[]> {
    const { data, error } = await supabase.from('gym_plans').select('*');
    if (error) {
      console.warn('Error fetching gym plans from Supabase:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map((row) => ({
      dayIndex: row.day_index,
      dayName: row.day_name,
      title: row.title,
      isRestDay: row.is_rest_day,
      exercises: row.exercises || [],
    }));
  },

  async upsertGymPlan(plan: PlanDay): Promise<void> {
    const payload = {
      day_index: plan.dayIndex,
      day_name: plan.dayName,
      title: plan.title,
      is_rest_day: plan.isRestDay,
      exercises: plan.exercises,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('gym_plans').upsert(payload, { onConflict: 'day_index' });
    if (error) console.warn('Error upserting gym plan to Supabase:', error.message);
  },

  async fetchCustomExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase.from('gym_custom_exercises').select('*');
    if (error) {
      console.warn('Error fetching custom exercises:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      defaultSets: row.default_sets,
      defaultReps: row.default_reps,
      isCustom: row.is_custom,
    }));
  },

  async upsertCustomExercise(exercise: Exercise): Promise<void> {
    const payload = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      default_sets: exercise.defaultSets || 3,
      default_reps: exercise.defaultReps || '10',
      is_custom: exercise.isCustom ?? true,
    };
    const { error } = await supabase.from('gym_custom_exercises').upsert(payload, { onConflict: 'id' });
    if (error) console.warn('Error upserting custom exercise:', error.message);
  },

  async deleteCustomExercise(id: string): Promise<void> {
    const { error } = await supabase.from('gym_custom_exercises').delete().eq('id', id);
    if (error) console.warn('Error deleting custom exercise:', error.message);
  },

  async fetchWorkoutLogs(): Promise<Record<string, WorkoutLog>> {
    const { data, error } = await supabase.from('workout_logs').select('*');
    if (error) {
      console.warn('Error fetching workout logs from Supabase:', error.message);
      return {};
    }
    const result: Record<string, WorkoutLog> = {};
    if (data) {
      for (const row of data) {
        result[row.date_key] = row.workout_data;
      }
    }
    return result;
  },

  async upsertWorkoutLog(dateKey: string, log: WorkoutLog): Promise<void> {
    const payload = {
      date_key: dateKey,
      workout_data: log,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('workout_logs').upsert(payload, { onConflict: 'date_key' });
    if (error) console.warn('Error upserting workout log to Supabase:', error.message);
  },

  async deleteWorkoutLog(dateKey: string): Promise<void> {
    const { error } = await supabase.from('workout_logs').delete().eq('date_key', dateKey);
    if (error) console.warn('Error deleting workout log from Supabase:', error.message);
  },
};
