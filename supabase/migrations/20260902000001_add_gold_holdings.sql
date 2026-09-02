-- Store physical gold purchases and their eventual sales.

CREATE TABLE IF NOT EXISTS public.gold_holdings (
    id TEXT PRIMARY KEY,
    kyat NUMERIC NOT NULL DEFAULT 0 CHECK (kyat >= 0),
    pae NUMERIC NOT NULL DEFAULT 0 CHECK (pae >= 0),
    yway NUMERIC NOT NULL DEFAULT 0 CHECK (yway >= 0),
    buy_price NUMERIC NOT NULL CHECK (buy_price > 0),
    currency TEXT NOT NULL DEFAULT 'MMK',
    purchase_date TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'holding' CHECK (status IN ('holding', 'sold')),
    sell_price NUMERIC CHECK (sell_price > 0),
    sold_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CHECK (kyat > 0 OR pae > 0 OR yway > 0),
    CHECK (
      (status = 'holding' AND sell_price IS NULL AND sold_date IS NULL)
      OR
      (status = 'sold' AND sell_price IS NOT NULL AND sold_date IS NOT NULL)
    )
);

ALTER TABLE public.gold_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on gold_holdings" ON public.gold_holdings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on gold_holdings" ON public.gold_holdings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on gold_holdings" ON public.gold_holdings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on gold_holdings" ON public.gold_holdings FOR DELETE USING (true);
