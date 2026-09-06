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

-- Extra fixtures for archive / no-hard-delete checks.
reset role;
set local session_replication_role = replica;

insert into public.profiles (id, full_name)
values
  ('c0000000-0000-0000-0000-000000000003', 'Alpha Coordinator'),
  ('d0000000-0000-0000-0000-000000000004', 'Alpha Teacher');

insert into public.school_members (school_id, user_id, role)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'coordinator'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000004',
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
  affected_rows integer;
  visible_schools integer;
begin
  -- Hard DELETE must not remove memberships (privilege revoke and/or no policy).
  begin
    delete from public.school_members
    where school_id = '10000000-0000-0000-0000-000000000001'
      and user_id = 'd0000000-0000-0000-0000-000000000004';
    get diagnostics affected_rows = row_count;
    if affected_rows <> 0 then
      raise exception 'RLS failure: DELETE on school_members modified % rows', affected_rows;
    end if;
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

-- Coordinator must not write archive columns.
select set_config(
  'request.jwt.claims',
  '{"sub":"c0000000-0000-0000-0000-000000000003","role":"authenticated","school_id":"10000000-0000-0000-0000-000000000001","school_role":"coordinator"}',
  true
);

do $$
declare
  affected_rows integer;
begin
  update public.school_members
  set
    archived_at = now(),
    archived_by = 'c0000000-0000-0000-0000-000000000003',
    is_active = false
  where school_id = '10000000-0000-0000-0000-000000000001'
    and user_id = 'd0000000-0000-0000-0000-000000000004';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception
      'RLS failure: coordinator archived a member (% rows)',
      affected_rows;
  end if;
end
$$;

-- Admin archives the teacher; archived identity loses is_school_member.
select set_config(
  'request.jwt.claims',
  '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated","school_id":"10000000-0000-0000-0000-000000000001","school_role":"school_admin"}',
  true
);

do $$
declare
  affected_rows integer;
  visible_schools integer;
begin
  update public.school_members
  set
    archived_at = now(),
    archived_by = 'a0000000-0000-0000-0000-000000000001',
    is_active = false
  where school_id = '10000000-0000-0000-0000-000000000001'
    and user_id = 'd0000000-0000-0000-0000-000000000004';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'RLS failure: admin archive wrote % rows, expected 1', affected_rows;
  end if;

  perform set_config(
    'request.jwt.claims',
    '{"sub":"d0000000-0000-0000-0000-000000000004","role":"authenticated","school_id":"10000000-0000-0000-0000-000000000001","school_role":"teacher"}',
    true
  );

  select count(*) into visible_schools from public.schools;
  if visible_schools <> 0 then
    raise exception
      'RLS failure: archived teacher saw % schools, expected 0',
      visible_schools;
  end if;
end
$$;

-- parent_links: tenant isolation (family cookie uses privileged getDb; staff uses RLS).
reset role;
set local session_replication_role = replica;

insert into public.students (
  id, school_id, admission_number, full_name, date_of_birth
)
values
  (
    'e0000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'ALP-001',
    'Alpha Child',
    '2013-01-01'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'BET-001',
    'Beta Child',
    '2013-01-01'
  );

insert into public.parent_links (id, school_id, family_id, student_id)
values
  (
    'f0000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'aa000000-0000-4000-8000-000000000001',
    'e0000000-0000-0000-0000-000000000001'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'bb000000-0000-4000-8000-000000000002',
    'e0000000-0000-0000-0000-000000000002'
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
  visible_links integer;
  affected_rows integer;
begin
  select count(*) into visible_links from public.parent_links;
  if visible_links <> 1 then
    raise exception
      'RLS failure: Alpha admin saw % parent_links, expected 1',
      visible_links;
  end if;

  begin
    insert into public.parent_links (school_id, family_id, student_id)
    values (
      '20000000-0000-0000-0000-000000000002',
      'cc000000-0000-4000-8000-000000000003',
      'e0000000-0000-0000-0000-000000000002'
    );
    get diagnostics affected_rows = row_count;
    if affected_rows <> 0 then
      raise exception
        'RLS failure: Alpha admin inserted % cross-tenant parent_links',
        affected_rows;
    end if;
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

-- classes: tenant isolation (school_admin writes own school only).
reset role;
set local session_replication_role = replica;

insert into public.classes (id, school_id, name, section, academic_year)
values
  (
    'c1000000-0000-4000-8000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Class 1',
    'A',
    '2024-25'
  ),
  (
    'c2000000-0000-4000-8000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Class 1',
    'A',
    '2024-25'
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
  visible_classes integer;
  affected_rows integer;
begin
  select count(*) into visible_classes from public.classes;
  if visible_classes <> 1 then
    raise exception
      'RLS failure: Alpha admin saw % classes, expected 1',
      visible_classes;
  end if;

  begin
    insert into public.classes (school_id, name, section, academic_year)
    values (
      '20000000-0000-0000-0000-000000000002',
      'Blocked',
      'A',
      '2024-25'
    );
    get diagnostics affected_rows = row_count;
    if affected_rows <> 0 then
      raise exception
        'RLS failure: Alpha admin inserted % cross-tenant classes',
        affected_rows;
    end if;
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

rollback;
