-- Migration: 20260801000000_add_budget_tables.sql
-- 6 Dedicated Supabase Tables for Budget Tracker

-- 1. Current Budget (Wallets per Currency)
CREATE TABLE IF NOT EXISTS public.current_budget (
    currency TEXT PRIMARY KEY, -- 'USDT', 'THB', 'MMK'
    balance NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.current_budget ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on current_budget" ON public.current_budget FOR SELECT USING (true);
CREATE POLICY "Allow public insert on current_budget" ON public.current_budget FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on current_budget" ON public.current_budget FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on current_budget" ON public.current_budget FOR DELETE USING (true);

-- Seed initial wallet balances
INSERT INTO public.current_budget (currency, balance)
VALUES ('USDT', 1000), ('THB', 8000), ('MMK', 36000000)
ON CONFLICT (currency) DO NOTHING;


-- 2. Family Budgets Table
CREATE TABLE IF NOT EXISTS public.family_budgets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'received', -- 'received' or 'given'
    person TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'MMK',
    date TEXT NOT NULL, -- YYYY-MM-DD
    note TEXT,
    add_to_current_budget BOOLEAN DEFAULT true,
    entry_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.family_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on family_budgets" ON public.family_budgets FOR SELECT USING (true);
CREATE POLICY "Allow public insert on family_budgets" ON public.family_budgets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on family_budgets" ON public.family_budgets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on family_budgets" ON public.family_budgets FOR DELETE USING (true);


-- 3. Incomes Table
CREATE TABLE IF NOT EXISTS public.incomes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDT',
    category TEXT NOT NULL DEFAULT 'Freelance Gig',
    date TEXT NOT NULL, -- YYYY-MM-DD
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on incomes" ON public.incomes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on incomes" ON public.incomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on incomes" ON public.incomes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on incomes" ON public.incomes FOR DELETE USING (true);


-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDT',
    category TEXT NOT NULL DEFAULT 'Food & Groceries',
    date TEXT NOT NULL, -- YYYY-MM-DD
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on expenses" ON public.expenses FOR DELETE USING (true);


-- 5. Monthly Salary Table
CREATE TABLE IF NOT EXISTS public.monthly_salary (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDT',
    category TEXT NOT NULL DEFAULT 'Salary',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    disabled_reason TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.monthly_salary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on monthly_salary" ON public.monthly_salary FOR SELECT USING (true);
CREATE POLICY "Allow public insert on monthly_salary" ON public.monthly_salary FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on monthly_salary" ON public.monthly_salary FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on monthly_salary" ON public.monthly_salary FOR DELETE USING (true);


-- 6. Budget Settings Table
CREATE TABLE IF NOT EXISTS public.budget_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_settings',
    default_currency TEXT NOT NULL DEFAULT 'USDT',
    last_processed_month TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on budget_settings" ON public.budget_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on budget_settings" ON public.budget_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on budget_settings" ON public.budget_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on budget_settings" ON public.budget_settings FOR DELETE USING (true);

-- Seed default settings
INSERT INTO public.budget_settings (id, default_currency, last_processed_month)
VALUES ('default_settings', 'USDT', '')
ON CONFLICT (id) DO NOTHING;
