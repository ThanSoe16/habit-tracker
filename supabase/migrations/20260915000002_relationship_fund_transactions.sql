-- Preserve existing expenses, without inventing a person or moving legacy money.
ALTER TABLE public.relationship_fund_expenses RENAME TO relationship_fund_transactions;
ALTER TABLE public.relationship_fund_transactions
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'spend' CHECK (kind IN ('save', 'spend')),
  ADD COLUMN person TEXT CHECK (person IN ('TSO', 'Nway')),
  ADD COLUMN money_source TEXT NOT NULL DEFAULT 'extra' CHECK (money_source IN ('current_budget', 'extra'));

-- Defaults above are a backfill only. New transactions must supply these choices.
ALTER TABLE public.relationship_fund_transactions ALTER COLUMN kind DROP DEFAULT;
ALTER TABLE public.relationship_fund_transactions ALTER COLUMN money_source DROP DEFAULT;
GRANT INSERT (kind, person, money_source), UPDATE (kind, person, money_source)
  ON public.relationship_fund_transactions TO authenticated;

CREATE FUNCTION public.apply_relationship_fund_wallet_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  owner_id UUID;
  old_effect NUMERIC := 0;
  new_effect NUMERIC := 0;
  delta NUMERIC;
BEGIN
  IF TG_OP <> 'DELETE' THEN
    -- Legacy rows remain unassigned until edited; all new/edited rows need a person.
    IF NEW.person IS NULL THEN
      RAISE EXCEPTION 'Choose a person' USING ERRCODE = '23514';
    END IF;
    owner_id := NEW.user_id;
    IF NEW.money_source = 'current_budget' THEN
      new_effect := CASE WHEN NEW.kind = 'save' THEN NEW.amount ELSE -NEW.amount END;
    END IF;
  END IF;
  IF TG_OP <> 'INSERT' THEN
    owner_id := OLD.user_id;
    IF TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Ownership cannot change' USING ERRCODE = '42501';
    END IF;
    IF OLD.money_source = 'current_budget' THEN
      old_effect := CASE WHEN OLD.kind = 'save' THEN OLD.amount ELSE -OLD.amount END;
    END IF;
  END IF;
  delta := new_effect - old_effect;
  -- During an account cascade the wallet is being removed too.
  IF delta <> 0 AND EXISTS (SELECT 1 FROM auth.users WHERE id = owner_id) THEN
    INSERT INTO public.current_budget (user_id, currency, balance)
    VALUES (owner_id, 'MMK', delta)
    ON CONFLICT (user_id, currency) DO UPDATE
      SET balance = public.current_budget.balance + EXCLUDED.balance, updated_at = now();
  END IF;
  -- The wallet update and ledger write commit or roll back together. No clamping:
  -- exact deltas make repeated edits and deletion reversals lossless.
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_relationship_fund_wallet_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER relationship_fund_wallet_change
  AFTER INSERT OR UPDATE OR DELETE ON public.relationship_fund_transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_relationship_fund_wallet_change();
