-- Migration: 20260801000001_add_currency_exchanges.sql
-- Table for Currency Exchange History

CREATE TABLE IF NOT EXISTS public.currency_exchanges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    from_currency TEXT NOT NULL,
    from_amount NUMERIC NOT NULL,
    to_currency TEXT NOT NULL,
    to_amount NUMERIC NOT NULL,
    rate NUMERIC,
    date TEXT NOT NULL, -- YYYY-MM-DD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.currency_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on currency_exchanges" ON public.currency_exchanges FOR SELECT USING (true);
CREATE POLICY "Allow public insert on currency_exchanges" ON public.currency_exchanges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on currency_exchanges" ON public.currency_exchanges FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on currency_exchanges" ON public.currency_exchanges FOR DELETE USING (true);
