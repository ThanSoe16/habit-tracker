import { supabase } from './client';
import { Habit } from '@/store/useHabitStore';
import { MoodEntry } from '@/store/useMoodStore';
import { PlanDay, Exercise, WorkoutLog } from '@/store/useGymStore';
import { MediaEntry } from '@/store/useMediaStore';
import { WalletBalances } from '@/store/useBudgetStore';

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

/**
 * Supabase service for syncing Budget data across 6 dedicated tables:
 * 1. current_budget (wallets)
 * 2. family_budgets
 * 3. incomes
 * 4. expenses
 * 5. monthly_salary
 * 6. budget_settings
 */
export const budgetService = {
  async fetchBudgetData(): Promise<{
    walletBalances?: WalletBalances;
    monthlySalaries?: any[];
    budgetEntries?: any[];
    familyTransactions?: any[];
    loans?: any[];
    lastProcessedMonth?: string;
    currency?: string;
  } | null> {
    try {
      const [
        walletsRes,
        familyRes,
        incomesRes,
        expensesRes,
        salaryRes,
        settingsRes,
        loansRes,
      ] = await Promise.all([
        supabase.from('current_budget').select('*'),
        supabase.from('family_budgets').select('*'),
        supabase.from('incomes').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('monthly_salary').select('*'),
        supabase.from('budget_settings').select('*').eq('id', 'default_settings').maybeSingle(),
        supabase.from('loans').select('*'),
      ]);

      const walletBalances: WalletBalances = { USDT: 0, THB: 0, MMK: 0, SGD: 0 };
      if (walletsRes.data) {
        walletsRes.data.forEach((w: { currency: string; balance: number }) => {
          walletBalances[w.currency] = Number(w.balance) || 0;
        });
      }

      const familyTransactions = (familyRes.data || []).map((f: any) => ({
        id: f.id,
        type: f.type,
        person: f.person,
        amount: Number(f.amount),
        currency: f.currency,
        date: f.date,
        note: f.note || undefined,
        addToCurrentBudget: f.add_to_current_budget ?? true,
        entryId: f.entry_id || undefined,
      }));

      const incomesList = (incomesRes.data || []).map((i: any) => ({
        id: i.id,
        title: i.title,
        amount: Number(i.amount),
        currency: i.currency,
        type: 'income' as const,
        category: i.category,
        date: i.date,
        note: i.note || undefined,
      }));

      const expensesList = (expensesRes.data || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        currency: e.currency,
        type: 'expense' as const,
        category: e.category,
        date: e.date,
        note: e.note || undefined,
      }));

      const budgetEntries = [...incomesList, ...expensesList];

      const monthlySalaries = (salaryRes.data || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        amount: Number(s.amount),
        currency: s.currency,
        category: s.category,
        isEnabled: s.is_enabled ?? true,
        disabledReason: s.disabled_reason || undefined,
        note: s.note || undefined,
      }));

      const loans = (loansRes?.data || []).map((l: any) => ({
        id: l.id,
        type: l.type,
        personName: l.person_name,
        amount: Number(l.amount),
        currency: l.currency,
        status: l.status,
        repaidAmount: Number(l.repaid_amount || 0),
        dueDate: l.due_date || undefined,
        date: l.date,
        note: l.note || undefined,
      }));

      return {
        walletBalances,
        monthlySalaries,
        budgetEntries,
        familyTransactions,
        loans,
        lastProcessedMonth: settingsRes.data?.last_processed_month || '',
        currency: settingsRes.data?.default_currency || 'USDT',
      };
    } catch (err) {
      console.warn('Error fetching 6 budget tables from Supabase:', err);
      return null;
    }
  },

  async saveBudgetData(state: {
    walletBalances: WalletBalances;
    monthlySalaries: any[];
    budgetEntries: any[];
    familyTransactions: any[];
    currency?: string;
    lastProcessedMonth?: string;
  }): Promise<void> {
    try {
      // 1. Save Current Budget (Wallets)
      const walletPayloads = Object.entries(state.walletBalances).map(([currency, balance]) => ({
        currency,
        balance,
        updated_at: new Date().toISOString(),
      }));
      if (walletPayloads.length > 0) {
        await supabase.from('current_budget').upsert(walletPayloads, { onConflict: 'currency' });
      }

      // 2. Save Family Budgets
      const familyPayloads = state.familyTransactions.map((f) => ({
        id: f.id,
        type: f.type,
        person: f.person,
        amount: f.amount,
        currency: f.currency,
        date: f.date,
        note: f.note || null,
        add_to_current_budget: f.addToCurrentBudget ?? true,
        entry_id: f.entryId || null,
      }));
      if (familyPayloads.length > 0) {
        await supabase.from('family_budgets').upsert(familyPayloads, { onConflict: 'id' });
      }

      // 3. Save Incomes
      const incomeEntries = state.budgetEntries.filter((e) => e.type === 'income');
      const incomePayloads = incomeEntries.map((i) => ({
        id: i.id,
        title: i.title,
        amount: i.amount,
        currency: i.currency,
        category: i.category,
        date: i.date,
        note: i.note || null,
      }));
      if (incomePayloads.length > 0) {
        await supabase.from('incomes').upsert(incomePayloads, { onConflict: 'id' });
      }

      // 4. Save Expenses
      const expenseEntries = state.budgetEntries.filter((e) => e.type === 'expense');
      const expensePayloads = expenseEntries.map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        currency: e.currency,
        category: e.category,
        date: e.date,
        note: e.note || null,
      }));
      if (expensePayloads.length > 0) {
        await supabase.from('expenses').upsert(expensePayloads, { onConflict: 'id' });
      }

      // 5. Save Monthly Salary
      const salaryPayloads = state.monthlySalaries.map((s) => ({
        id: s.id,
        title: s.title,
        amount: s.amount,
        currency: s.currency,
        category: s.category,
        is_enabled: s.isEnabled ?? true,
        disabled_reason: s.disabledReason || null,
        note: s.note || null,
      }));
      if (salaryPayloads.length > 0) {
        await supabase.from('monthly_salary').upsert(salaryPayloads, { onConflict: 'id' });
      }

      // 6. Save Budget Settings
      await supabase.from('budget_settings').upsert(
        {
          id: 'default_settings',
          default_currency: state.currency || 'USDT',
          last_processed_month: state.lastProcessedMonth || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn('Error saving 6 budget tables to Supabase:', err);
    }
  },

  async deleteFamilyTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('family_budgets').delete().eq('id', id);
      if (error) {
        console.warn('Error deleting family transaction from Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error deleting family transaction:', err);
    }
  },

  async deleteMonthlySalary(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('monthly_salary').delete().eq('id', id);
      if (error) {
        console.warn('Error deleting monthly salary from Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error deleting monthly salary:', err);
    }
  },

  async deleteBudgetEntry(id: string, type?: 'income' | 'expense' | 'exchange'): Promise<void> {
    try {
      if (type === 'income') {
        await supabase.from('incomes').delete().eq('id', id);
      } else if (type === 'expense') {
        await supabase.from('expenses').delete().eq('id', id);
      } else {
        await Promise.all([
          supabase.from('incomes').delete().eq('id', id),
          supabase.from('expenses').delete().eq('id', id),
        ]);
      }
    } catch (err) {
      console.warn('Error deleting budget entry from Supabase:', err);
    }
  },

  async upsertLoan(loan: any): Promise<void> {
    try {
      const payload = {
        id: loan.id,
        type: loan.type,
        person_name: loan.personName,
        amount: loan.amount,
        currency: loan.currency,
        status: loan.status || 'pending',
        repaid_amount: loan.repaidAmount || 0,
        due_date: loan.dueDate || null,
        date: loan.date,
        note: loan.note || null,
      };
      await supabase.from('loans').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.warn('Error upserting loan in Supabase:', err);
    }
  },

  async deleteLoan(id: string): Promise<void> {
    try {
      await supabase.from('loans').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting loan from Supabase:', err);
    }
  },

  async clearAllBudgetData(): Promise<void> {
    try {
      await Promise.all([
        supabase.from('family_budgets').delete().neq('id', ''),
        supabase.from('incomes').delete().neq('id', ''),
        supabase.from('expenses').delete().neq('id', ''),
        supabase.from('monthly_salary').delete().neq('id', ''),
        supabase.from('loans').delete().neq('id', ''),
      ]);
    } catch (err) {
      console.warn('Error clearing budget data from Supabase:', err);
    }
  },
};
