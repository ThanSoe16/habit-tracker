-- Migration: 20260805000001_add_loans.sql
-- Table for Loans & Debts Tracking

CREATE TABLE IF NOT EXISTS public.loans (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'lend' (money out) | 'borrow' (money in)
    person_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL, -- 'USDT' | 'THB' | 'MMK' | 'SGD'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'repaid' | 'partial'
    repaid_amount NUMERIC DEFAULT 0,
    due_date TEXT, -- YYYY-MM-DD
    date TEXT NOT NULL, -- YYYY-MM-DD
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on loans" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Allow public insert on loans" ON public.loans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on loans" ON public.loans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on loans" ON public.loans FOR DELETE USING (true);
