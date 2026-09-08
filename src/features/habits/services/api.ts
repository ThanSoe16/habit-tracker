import { habitsService } from './supabase';
import { type HabitFilterParams, type Habit, habitFilterSchema, habitRecordSchema } from '../types';

const habitsApiService = {
  getHabits: async (params?: HabitFilterParams): Promise<Habit[]> => {
    const filters = habitFilterSchema.optional().parse(params);
    const habits = await habitsService.fetchHabits();
    if (!habits) throw new Error('Could not load your habits. Please try again.');
    return habits.filter((h) => {
      if (filters?.type && h.type !== filters.type) return false;
      if (filters?.habitKind && (h.habitKind ?? 'build') !== filters.habitKind) return false;
      if (filters?.frequency && h.frequency !== filters.frequency) return false;
      if (filters?.search && !h.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  },

  getHabitById: async (id: string): Promise<Habit | null> => {
    const recordId = habitRecordSchema.shape.id.parse(id);
    const habits = await habitsService.fetchHabits();
    if (!habits) throw new Error('Could not load the habit. Please try again.');
    return habits.find((h) => h.id === recordId) ?? null;
  },

  saveHabit: async (habit: Habit): Promise<Habit> => {
    const validatedHabit = habitRecordSchema.parse(habit);
    return habitsService.saveHabit(validatedHabit);
  },

  deleteHabit: async (id: string): Promise<boolean> => {
    const recordId = habitRecordSchema.shape.id.parse(id);
    const deleted = await habitsService.deleteHabit(recordId);
    if (!deleted) throw new Error('Could not delete the habit. Please try again.');
    return true;
  },
};

export default habitsApiService;
