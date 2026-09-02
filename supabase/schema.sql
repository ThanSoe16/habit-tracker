-- Supabase Schema for Habit Tracker & Gym Planner

-- Enable Row Level Security (RLS) policies for anonymous/public access or customized auth rules

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    name TEXT NOT NULL DEFAULT 'User',
    avatar_emoji TEXT DEFAULT '😊',
    joined_at TEXT,
    reminders_enabled BOOLEAN DEFAULT false,
    daily_reminder_time TEXT DEFAULT '08:00',
    ringtone TEXT DEFAULT 'chime',
    custom_ringtone_url TEXT,
    vibration_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    home_settings JSONB DEFAULT '{}'::jsonb,
    mood_settings JSONB DEFAULT '{"enableNotes": true, "showStreak": true}'::jsonb,
    gym_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_profiles" ON public.user_profiles FOR UPDATE USING (true);

-- 2. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366F1',
    emoji TEXT,
    frequency TEXT NOT NULL DEFAULT 'daily',
    repeat_days JSONB DEFAULT '[]'::jsonb,
    type TEXT DEFAULT 'habit',
    start_date TEXT,
    end_date TEXT,
    time_of_day TEXT,
    reminder_time TEXT,
    end_habit_date TEXT,
    end_habit_days INT,
    specific_dates JSONB DEFAULT '[]'::jsonb,
    unit_type TEXT DEFAULT 'simple',
    unit TEXT,
    goal_value NUMERIC,
    timer_mode TEXT,
    time_unit TEXT,
    history JSONB DEFAULT '{}'::jsonb,
    streak INT DEFAULT 0,
    sort_order INT,
    created_at TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on habits" ON public.habits FOR SELECT USING (true);
CREATE POLICY "Allow public insert on habits" ON public.habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on habits" ON public.habits FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on habits" ON public.habits FOR DELETE USING (true);

-- 3. Custom Units Table
CREATE TABLE IF NOT EXISTS public.custom_units (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.custom_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on custom_units" ON public.custom_units FOR SELECT USING (true);
CREATE POLICY "Allow public insert on custom_units" ON public.custom_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on custom_units" ON public.custom_units FOR DELETE USING (true);

-- 4. Mood Entries Table
CREATE TABLE IF NOT EXISTS public.mood_entries (
    date_key TEXT PRIMARY KEY,
    mood TEXT NOT NULL,
    label TEXT NOT NULL,
    emoji TEXT NOT NULL,
    tag TEXT,
    timestamp TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on mood_entries" ON public.mood_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on mood_entries" ON public.mood_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on mood_entries" ON public.mood_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on mood_entries" ON public.mood_entries FOR DELETE USING (true);

-- 5. Gym Plans Table
CREATE TABLE IF NOT EXISTS public.gym_plans (
    day_index INT PRIMARY KEY,
    day_name TEXT NOT NULL,
    title TEXT NOT NULL,
    is_rest_day BOOLEAN DEFAULT false,
    exercises JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on gym_plans" ON public.gym_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert on gym_plans" ON public.gym_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on gym_plans" ON public.gym_plans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on gym_plans" ON public.gym_plans FOR DELETE USING (true);

-- 6. Gym Custom Exercises Table
CREATE TABLE IF NOT EXISTS public.gym_custom_exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    default_sets INT DEFAULT 3,
    default_reps TEXT DEFAULT '10',
    is_custom BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.gym_custom_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on gym_custom_exercises" ON public.gym_custom_exercises FOR SELECT USING (true);
CREATE POLICY "Allow public insert on gym_custom_exercises" ON public.gym_custom_exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on gym_custom_exercises" ON public.gym_custom_exercises FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on gym_custom_exercises" ON public.gym_custom_exercises FOR DELETE USING (true);

-- 7. Workout Logs Table
CREATE TABLE IF NOT EXISTS public.workout_logs (
    date_key TEXT PRIMARY KEY,
    workout_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on workout_logs" ON public.workout_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on workout_logs" ON public.workout_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on workout_logs" ON public.workout_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on workout_logs" ON public.workout_logs FOR DELETE USING (true);
