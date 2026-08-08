-- Run only against a disposable/local database after applying migrations.
-- The transaction is always rolled back and leaves no fixture data.
begin;

set local session_replication_role = replica;

insert into public.schools (id, name, slug, official_email_domain)
values
  ('10000000-0000-0000-0000-000000000001', 'Alpha School', 'alpha-school-bridge', 'alpha.example'),
  ('20000000-0000-0000-0000-000000000002', 'Beta School', 'beta-school-bridge', 'beta.example');

insert into public.profiles (id, full_name)
values
  ('a0000000-0000-0000-0000-000000000001', 'Alpha Admin'),
  ('b0000000-0000-0000-0000-000000000002', 'Beta Teacher');

insert into public.school_members (school_id, user_id, role)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'school_admin'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'teacher'
  );

set local session_replication_role = origin;

select set_config(
  'request.jwt.claims',
  '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated","school_id":"10000000-0000-0000-0000-000000000001","school_role":"school_admin"}',
  true
);
set local role authenticated;

do $$
declare
  visible_schools integer;
  visible_memberships integer;
  affected_rows integer;
begin
  select count(*) into visible_schools from public.schools;
  if visible_schools <> 1 then
    raise exception 'RLS failure: Alpha user saw % schools, expected 1', visible_schools;
  end if;

  select count(*) into visible_memberships from public.school_members;
  if visible_memberships <> 1 then
    raise exception
      'RLS failure: Alpha user saw % memberships, expected 1',
      visible_memberships;
  end if;

  update public.schools
  set name = 'Blocked cross-tenant update'
  where id = '20000000-0000-0000-0000-000000000002';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'RLS failure: cross-tenant update modified % rows', affected_rows;
  end if;
end
$$;

rollback;
