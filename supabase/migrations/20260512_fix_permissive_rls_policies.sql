-- Fix overly permissive RLS policies on companies, nfs_docs, sync_logs
-- Reported by Supabase security linter (rls_policy_always_true)
-- These tables had USING(true)/WITH CHECK(true) for ALL operations,
-- effectively bypassing row-level security for any role.

-- ── companies ────────────────────────────────────────────────────────────────

drop policy if exists "Allow all operations for anon/service_role" on public.companies;

create policy "companies_select_own" on public.companies
  for select using (auth.uid() = user_id);

create policy "companies_insert_own" on public.companies
  for insert with check (auth.uid() = user_id);

create policy "companies_update_own" on public.companies
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "companies_delete_own" on public.companies
  for delete using (auth.uid() = user_id);

-- ── nfs_docs ─────────────────────────────────────────────────────────────────

drop policy if exists "Allow all operations for anon/service_role" on public.nfs_docs;

create policy "nfs_docs_select_own" on public.nfs_docs
  for select using (auth.uid() = user_id);

create policy "nfs_docs_insert_own" on public.nfs_docs
  for insert with check (auth.uid() = user_id);

create policy "nfs_docs_update_own" on public.nfs_docs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "nfs_docs_delete_own" on public.nfs_docs
  for delete using (auth.uid() = user_id);

-- ── sync_logs ────────────────────────────────────────────────────────────────

drop policy if exists "Allow all operations for anon/service_role" on public.sync_logs;

create policy "sync_logs_select_own" on public.sync_logs
  for select using (auth.uid() = user_id);

create policy "sync_logs_insert_own" on public.sync_logs
  for insert with check (auth.uid() = user_id);

create policy "sync_logs_update_own" on public.sync_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sync_logs_delete_own" on public.sync_logs
  for delete using (auth.uid() = user_id);
