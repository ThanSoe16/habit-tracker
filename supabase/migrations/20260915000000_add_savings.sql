-- Savings are separate from spendable wallets. Only the functions below move money.
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  currency TEXT NOT NULL CHECK (currency IN ('MMK', 'THB', 'USDT', 'SGD')),
  target_amount NUMERIC CHECK (target_amount > 0 AND target_amount <= 1000000000000 AND scale(target_amount) <= 2),
  unlock_date DATE,
  unlock_rule TEXT NOT NULL CHECK (unlock_rule IN ('either', 'both')),
  note TEXT NOT NULL DEFAULT '' CHECK (length(note) <= 500),
  balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0 AND balance <= 1000000000000),
  target_reached_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, id),
  CHECK (target_amount IS NOT NULL OR unlock_date IS NOT NULL)
);
CREATE TABLE public.savings_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('deposit', 'withdrawal')),
  amount NUMERIC NOT NULL CHECK (amount > 0 AND amount <= 1000000000000 AND scale(amount) <= 2),
  person TEXT NOT NULL DEFAULT '' CHECK (length(person) <= 100),
  note TEXT NOT NULL DEFAULT '' CHECK (length(note) <= 500),
  to_budget BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id, goal_id) REFERENCES public.savings_goals(user_id, id) ON DELETE CASCADE,
  CHECK (kind = 'withdrawal' OR NOT to_budget)
);
CREATE INDEX ON public.savings_goals (user_id, created_at DESC, id);
CREATE INDEX ON public.savings_transactions (user_id, goal_id, created_at DESC, id);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.savings_goals, public.savings_transactions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.savings_goals, public.savings_transactions TO authenticated;
CREATE POLICY savings_owner_read ON public.savings_goals FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY savings_history_owner_read ON public.savings_transactions FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE FUNCTION public.create_savings_goal(
  p_id UUID, p_name TEXT, p_currency TEXT, p_target_amount NUMERIC,
  p_unlock_date DATE, p_unlock_rule TEXT, p_note TEXT
) RETURNS public.savings_goals LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result public.savings_goals;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.savings_goals (id, user_id, name, currency, target_amount, unlock_date, unlock_rule, note)
  VALUES (p_id, auth.uid(), btrim(p_name), p_currency, p_target_amount, p_unlock_date, p_unlock_rule, p_note)
  ON CONFLICT (id) DO NOTHING RETURNING * INTO result;
  IF result.id IS NULL THEN
    SELECT * INTO result FROM public.savings_goals WHERE id = p_id AND user_id = auth.uid();
    IF result.id IS NULL THEN RAISE EXCEPTION 'Unavailable' USING ERRCODE = '42501'; END IF;
    IF (result.name, result.currency, result.target_amount, result.unlock_date, result.unlock_rule, result.note)
      IS DISTINCT FROM (btrim(p_name), p_currency, p_target_amount, p_unlock_date, p_unlock_rule, p_note) THEN
      RAISE EXCEPTION 'Request changed' USING ERRCODE = '22023';
    END IF;
  END IF;
  RETURN result;
END;
$$;

CREATE FUNCTION public.record_savings_transaction(
  p_id UUID, p_goal_id UUID, p_kind TEXT, p_amount NUMERIC,
  p_person TEXT, p_note TEXT, p_to_budget BOOLEAN
) RETURNS public.savings_goals LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE goal public.savings_goals; previous public.savings_transactions;
  amount_ready BOOLEAN; date_ready BOOLEAN; unlocked BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  SELECT * INTO goal FROM public.savings_goals WHERE id = p_goal_id AND user_id = auth.uid() FOR UPDATE;
  IF goal.id IS NULL THEN RAISE EXCEPTION 'Unavailable' USING ERRCODE = '42501'; END IF;
  SELECT * INTO previous FROM public.savings_transactions WHERE id = p_id;
  IF previous.id IS NOT NULL THEN
    IF (previous.user_id, previous.goal_id, previous.kind, previous.amount, previous.person, previous.note, previous.to_budget)
      IS DISTINCT FROM (auth.uid(), p_goal_id, p_kind, p_amount, p_person, p_note, p_to_budget) THEN
      RAISE EXCEPTION 'Request changed' USING ERRCODE = '22023';
    END IF;
    RETURN goal;
  END IF;
  -- Validate before arithmetic; table constraints are a second line of defense.
  IF p_kind IS NULL OR p_kind NOT IN ('deposit', 'withdrawal') OR p_amount IS NULL
    OR NOT (p_amount > 0 AND p_amount <= 1000000000000 AND scale(p_amount) <= 2)
    OR p_to_budget IS NULL OR (p_kind = 'deposit' AND p_to_budget) THEN
    RAISE EXCEPTION 'Invalid transaction' USING ERRCODE = '22023';
  END IF;
  IF p_kind = 'withdrawal' THEN
    amount_ready := goal.target_reached_at IS NOT NULL;
    date_ready := goal.unlock_date IS NOT NULL AND (now() AT TIME ZONE 'UTC')::date >= goal.unlock_date;
    unlocked := CASE WHEN goal.unlock_rule = 'both' THEN
      (goal.target_amount IS NULL OR amount_ready) AND (goal.unlock_date IS NULL OR date_ready)
      ELSE amount_ready OR date_ready END;
    IF NOT unlocked THEN RAISE EXCEPTION 'Savings locked' USING ERRCODE = 'P0001'; END IF;
    IF p_amount > goal.balance THEN RAISE EXCEPTION 'Insufficient savings' USING ERRCODE = 'P0002'; END IF;
  END IF;
  UPDATE public.savings_goals SET
    balance = balance + CASE WHEN p_kind = 'deposit' THEN p_amount ELSE -p_amount END,
    target_reached_at = CASE WHEN target_amount IS NOT NULL AND balance +
      CASE WHEN p_kind = 'deposit' THEN p_amount ELSE -p_amount END >= target_amount
      THEN coalesce(target_reached_at, now()) ELSE target_reached_at END
  WHERE id = goal.id RETURNING * INTO goal;
  INSERT INTO public.savings_transactions (id, user_id, goal_id, kind, amount, person, note, to_budget)
  VALUES (p_id, auth.uid(), p_goal_id, p_kind, p_amount, p_person, p_note, p_to_budget);
  IF p_kind = 'withdrawal' AND p_to_budget THEN
    INSERT INTO public.current_budget (user_id, currency, balance) VALUES (auth.uid(), goal.currency, p_amount)
    ON CONFLICT (user_id, currency) DO UPDATE SET balance = public.current_budget.balance + EXCLUDED.balance, updated_at = now();
    INSERT INTO public.incomes (user_id, id, title, amount, currency, category, date, note)
    VALUES (auth.uid(), 'savings-' || p_id::text, 'Withdrawal from ' || goal.name, p_amount,
      goal.currency, 'Savings', (now() AT TIME ZONE 'UTC')::date::text, p_note);
  END IF;
  RETURN goal;
END;
$$;
REVOKE ALL ON FUNCTION public.create_savings_goal(UUID, TEXT, TEXT, NUMERIC, DATE, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_savings_transaction(UUID, UUID, TEXT, NUMERIC, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_savings_goal(UUID, TEXT, TEXT, NUMERIC, DATE, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_savings_transaction(UUID, UUID, TEXT, NUMERIC, TEXT, TEXT, BOOLEAN) TO authenticated;
