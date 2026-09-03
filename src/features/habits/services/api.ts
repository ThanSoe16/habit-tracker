import { habitsService } from './supabase';
import { HabitFilterParams, Habit, habitFilterSchema, habitRecordSchema } from '../types';

const habitsApiService = {
  getHabits: async (params?: HabitFilterParams): Promise<Habit[]> => {
    const filters = habitFilterSchema.optional().parse(params);
    const habits = (await habitsService.fetchHabits()) ?? [];
    return habits.filter((h) => {
      if (filters?.type && h.type !== filters.type) return false;
      if (filters?.frequency && h.frequency !== filters.frequency) return false;
      if (filters?.search && !h.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  },

  getHabitById: async (id: string): Promise<Habit | undefined> => {
    const habits = (await habitsService.fetchHabits()) ?? [];
    return habits.find((h) => h.id === id);
  },

  saveHabit: async (habit: Habit): Promise<Habit> => {
    const validatedHabit = habitRecordSchema.parse(habit);
    await habitsService.upsertHabit(validatedHabit);
    return validatedHabit;
  },

  deleteHabit: async (id: string): Promise<boolean> => {
    await habitsService.deleteHabit(id);
    return true;
  },
};

export default habitsApiService;
