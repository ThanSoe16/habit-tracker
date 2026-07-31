import { supabase } from './client';
import { Habit } from '@/store/useHabitStore';
import { MoodEntry } from '@/store/useMoodStore';
import { PlanDay, Exercise, WorkoutLog } from '@/store/useGymStore';
import { MediaEntry } from '@/store/useMediaStore';

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
    homeSettings?: Record<string, any>;
  }) {
    const payload = {
      id: 'default_user',
      name: profile.name,
      avatar_emoji: profile.avatarEmoji,
      joined_at: profile.joinedAt,
      reminders_enabled: profile.remindersEnabled,
      daily_reminder_time: profile.dailyReminderTime,
      theme: profile.theme,
      home_settings: profile.homeSettings,
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

  async fetchGymSettings(): Promise<Record<string, any> | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('gym_settings')
      .eq('id', 'default_user')
      .single();

    if (error) return null;
    return data?.gym_settings || null;
  },

  async saveGymSettings(settings: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: 'default_user', gym_settings: settings }, { onConflict: 'id' });

    if (error) console.warn('Error saving gym settings to Supabase:', error.message);
  },
};

export interface BodyMetricRow {
  id?: string;
  user_id?: string;
  logged_at: string; // YYYY-MM-DD
  height_cm?: number;
  weight_kg: number;
  target_weight_kg?: number;
  body_fat_pct?: number;
  muscle_mass_kg?: number;
  fitness_goal?: string;
  activity_level?: string;
  notes?: string;
}

export const gymBodyMetricsService = {
  async fetchLogs(): Promise<BodyMetricRow[]> {
    const { data, error } = await supabase
      .from('gym_body_metrics')
      .select('*')
      .eq('user_id', 'default_user')
      .order('logged_at', { ascending: true });

    if (error) {
      console.warn('Error fetching gym_body_metrics from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  async insertLog(row: BodyMetricRow): Promise<BodyMetricRow | null> {
    const payload = {
      user_id: 'default_user',
      logged_at: row.logged_at,
      height_cm: row.height_cm,
      weight_kg: row.weight_kg,
      target_weight_kg: row.target_weight_kg,
      body_fat_pct: row.body_fat_pct,
      muscle_mass_kg: row.muscle_mass_kg,
      fitness_goal: row.fitness_goal,
      activity_level: row.activity_level,
      notes: row.notes,
    };
    const { data, error } = await supabase
      .from('gym_body_metrics')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.warn('Error inserting body metric log:', error.message);
      return null;
    }
    return data;
  },

  async deleteLog(id: string): Promise<void> {
    const { error } = await supabase.from('gym_body_metrics').delete().eq('id', id);
    if (error) console.warn('Error deleting body metric log:', error.message);
  },
};

export interface MediaItemRow {
  id?: string;
  user_id?: string;
  type: 'voice' | 'photo' | 'video';
  title: string;
  data_url: string;
  thumbnail_url?: string | null;
  file_size?: number | null;
  duration?: number | null;
  mime_type: string;
  created_at?: string;
}

export const mediaItemsService = {
  async fetchMediaEntries(): Promise<MediaEntry[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', 'default_user')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching media_items from Supabase:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map((row: MediaItemRow) => ({
      id: row.id || '',
      type: row.type,
      title: row.title,
      dataUrl: row.data_url,
      thumbnailUrl: row.thumbnail_url || undefined,
      fileSize: Number(row.file_size || 0),
      duration: row.duration ? Number(row.duration) : undefined,
      mimeType: row.mime_type,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  },

  async insertMediaEntry(entry: MediaEntry): Promise<MediaEntry | null> {
    const payload: MediaItemRow = {
      id: entry.id,
      user_id: 'default_user',
      type: entry.type,
      title: entry.title,
      data_url: entry.dataUrl,
      thumbnail_url: entry.thumbnailUrl || null,
      file_size: entry.fileSize,
      duration: entry.duration || null,
      mime_type: entry.mimeType,
      created_at: entry.createdAt,
    };

    const { data, error } = await supabase
      .from('media_items')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.warn('Error inserting media item:', error.message);
      return entry;
    }
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      dataUrl: data.data_url,
      thumbnailUrl: data.thumbnail_url || undefined,
      fileSize: Number(data.file_size || 0),
      duration: data.duration ? Number(data.duration) : undefined,
      mimeType: data.mime_type,
      createdAt: data.created_at || new Date().toISOString(),
    };
  },

  async deleteMediaEntry(id: string): Promise<void> {
    const { error } = await supabase.from('media_items').delete().eq('id', id);
    if (error) console.warn('Error deleting media item:', error.message);
  },
};

/**
 * Uploads a media File or Blob to Supabase Storage bucket 'media_store'
 * and returns the clean public URL (e.g. https://.../storage/v1/object/public/media_store/...)
 */
export async function uploadMediaToStorage(fileOrBlob: Blob | File, filename?: string): Promise<string> {
  try {
    const ext =
      filename?.split('.').pop() ||
      (fileOrBlob.type.includes('audio')
        ? 'webm'
        : fileOrBlob.type.includes('video')
          ? 'mp4'
          : 'jpg');
    const filePath = `store/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error } = await supabase.storage
      .from('media_store')
      .upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileOrBlob.type || 'application/octet-stream',
      });

    if (error) {
      console.warn('Supabase storage upload warning:', error.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('media_store')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || '';
  } catch (err) {
    console.error('Storage upload error:', err);
    return '';
  }
}
