-- Relationship funds are a separate ledger. Preserve recorded transactions and
-- existing wallet balances; do not retrospectively reverse historical transfers.
DROP TRIGGER relationship_fund_wallet_change ON public.relationship_fund_transactions;
DROP FUNCTION public.apply_relationship_fund_wallet_change();

-- Keep the validation previously performed by the wallet trigger. Legacy rows
-- may remain unassigned until edited, when a person must be selected.
CREATE FUNCTION public.validate_relationship_fund_transaction()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.person IS NULL THEN
    RAISE EXCEPTION 'Choose a person' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Ownership cannot change' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_relationship_fund_transaction() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER relationship_fund_validate
  BEFORE INSERT OR UPDATE ON public.relationship_fund_transactions
  FOR EACH ROW EXECUTE FUNCTION public.validate_relationship_fund_transaction();

-- Retain money_source as historical metadata for existing rows and older clients.
-- Neither value has a wallet effect after this migration.
