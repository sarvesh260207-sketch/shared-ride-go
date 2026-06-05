
DROP POLICY IF EXISTS "Ledger entries viewable for auditors" ON public.carbon_ledger;
DROP POLICY IF EXISTS "Anyone can view shares by token" ON public.guardian_shares;

DROP POLICY IF EXISTS "Users can view all badges" ON public.user_badges;
CREATE POLICY "Authenticated users can view badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (true);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
