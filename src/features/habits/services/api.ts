import { habitsService } from '@/lib/supabase/services';
import { HabitFilterParams, HabitData, Habit } from '../types';

const habitsApiService = {
  getHabits: async (params?: HabitFilterParams): Promise<Habit[]> => {
    const habits = await habitsService.fetchHabits();
    return habits.filter((h) => {
      if (params?.type && h.type !== params.type) return false;
      if (params?.frequency && h.frequency !== params.frequency) return false;
      if (params?.search && !h.name.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
  },

  getHabitById: async (id: string): Promise<Habit | undefined> => {
    const habits = await habitsService.fetchHabits();
    return habits.find((h) => h.id === id);
  },

  saveHabit: async (habit: Habit): Promise<Habit> => {
    await habitsService.upsertHabit(habit);
    return habit;
  },

  deleteHabit: async (id: string): Promise<boolean> => {
    await habitsService.deleteHabit(id);
    return true;
  },
};

export default habitsApiService;
