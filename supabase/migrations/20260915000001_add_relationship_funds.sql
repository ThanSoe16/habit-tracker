-- A monthly 600,000 MMK allowance is derived by the app; only actual spending
-- is persisted. This ledger is separate from personal expenses and wallets.
CREATE TABLE public.relationship_fund_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 100),
  amount NUMERIC NOT NULL CHECK (amount > 0 AND amount <= 1000000000000 AND amount = trunc(amount)),
  date DATE NOT NULL CHECK (date BETWEEN DATE '1900-01-01' AND DATE '9999-12-31'),
  note TEXT NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX relationship_fund_expenses_month_idx
  ON public.relationship_fund_expenses (user_id, date DESC, id);

ALTER TABLE public.relationship_fund_expenses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.relationship_fund_expenses FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.relationship_fund_expenses TO authenticated;
GRANT INSERT (id, title, amount, date, note) ON public.relationship_fund_expenses TO authenticated;
GRANT UPDATE (title, amount, date, note) ON public.relationship_fund_expenses TO authenticated;
GRANT ALL ON public.relationship_fund_expenses TO service_role;

CREATE POLICY relationship_fund_expenses_select ON public.relationship_fund_expenses
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY relationship_fund_expenses_insert ON public.relationship_fund_expenses
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY relationship_fund_expenses_update ON public.relationship_fund_expenses
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY relationship_fund_expenses_delete ON public.relationship_fund_expenses
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
